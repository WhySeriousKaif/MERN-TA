// This file connects each endpoint (URL) to its controller function.

const express = require("express");
const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
} = require("../controllers/customer.controller");

const authMiddleware = require("../middlewares/auth.middleware");

// Public routes (no login required)
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

// Protected routes (login required, that's why authMiddleware runs first)
router.get("/me", authMiddleware, getMyProfile);
router.post("/logout", authMiddleware, logoutCustomer);

// Bonus route
router.patch("/change-password", authMiddleware, changePassword);

module.exports = router;
