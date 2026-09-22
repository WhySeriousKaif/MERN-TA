// =========================================================
// ShopKart Backend Server — Lab 03 Entry Point
// =========================================================
// Integrates:
// 1. Customer Authentication Service (Lab 01 & Lab 02)
// 2. Product Catalog & Discovery Service (Lab 03)
// =========================================================

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Middlewares
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // Enables HttpOnly cookie transmission across ports
  })
);
app.use(express.json()); // Parses application/json in req.body
app.use(cookieParser()); // Parses cookies from req.headers.cookie into req.cookies

// Mount Routes
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);

// Root Health Check Route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "ShopKart Fullstack API (Lab 03 - Product Catalog & Discovery)",
    endpoints: {
      auth: "/customers",
      products: "/products",
    },
  });
});

// Fallback 404 Handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this server`,
  });
});

// Connect to MongoDB and start HTTP Server
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart")
  .then(() => {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`ShopKart Lab 03 Server running on port ${PORT}`);
      console.log(`Accepting requests from frontend at: ${CLIENT_URL}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
