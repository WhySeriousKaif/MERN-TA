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

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: { type: String },
    email: { type: String },
  })
);

// Your code goes here

module.exports = { app, User };
