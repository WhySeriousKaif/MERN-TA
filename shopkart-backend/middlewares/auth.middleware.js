// This middleware protects routes that should only be accessible
// to a logged-in customer (example: /customers/me).

const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

async function authMiddleware(req, res, next) {
  try {
    // 1. Read the token from the cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the customer in the database using the id stored in the token
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 4. Attach the customer to the request object so controllers can use it
    req.user = customer;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports = authMiddleware;
