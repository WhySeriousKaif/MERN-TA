// This file defines how a "Customer" is stored in MongoDB.

const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // no two customers can have the same email
  },
  password: {
    type: String,
    required: true, // this will always store the bcrypt HASH, never plain text
  },
  phone: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // automatically set when a customer is created
  },
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
