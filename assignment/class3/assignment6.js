const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

/** Do not change the connection string below */
mongoose.connect("mongodb://localhost:27017/myApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
/** connection ends */

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  price: { type: Number, min: 0 },
  specs: { type: Object },
});
const Product = mongoose.model("product", productSchema);

// Your code goes here

module.exports = { app, Product };
