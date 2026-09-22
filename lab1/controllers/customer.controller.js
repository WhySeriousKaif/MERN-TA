// This file contains all the logic for customer authentication.

const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

// ---------------------------------------------------
// 1.Register
// ---------------------------------------------------
async function registerCustomer(req, res) {
  try {
    const { fullName, email, password, phone } = req.body;

    // Check all fields are present
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash the password before saving (never save plain text password)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the customer in the database
    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    // Send response without the password field
    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

// ---------------------------------------------------
// 2. LOGIN
// ---------------------------------------------------
async function loginCustomer(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email });

    // We use the SAME error message for both cases below
    // so we don't reveal whether the email or the password was wrong.
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare entered password with hashed password in database
    const isPasswordCorrect = await bcrypt.compare(password, customer.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(customer);

    // Store token inside an HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true, // JavaScript on the browser cannot access this cookie
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

// ---------------------------------------------------
// 3. MY PROFILE (protected route)
// ---------------------------------------------------
async function getMyProfile(req, res) {
  // req.user was already attached by the auth middleware
  return res.status(200).json(req.user);
}

// ---------------------------------------------------
// 4. LOGOUT
// ---------------------------------------------------
async function logoutCustomer(req, res) {
  // Clear the cookie that stores the JWT
  res.clearCookie("token");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

// ---------------------------------------------------
// BONUS: CHANGE PASSWORD (protected route)
// ---------------------------------------------------
async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // req.user only has the id (password field is excluded in middleware),
    // so we fetch the customer again with the password included.
    const customer = await Customer.findById(req.user._id);

    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, customer.password);

    if (!isOldPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // Hash the new password and save it
    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
};
