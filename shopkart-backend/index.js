// Entry point of the ShopKart Authentication Service.

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const customerRoutes = require("./routes/customer.routes");

const app = express();

// Middlewares
app.use(express.json()); // to read JSON from req.body
app.use(cookieParser()); // to read cookies from req.cookies

// Routes
app.use("/customers", customerRoutes);

// Simple test route
app.get("/", (req, res) => {
  res.send("ShopKart Authentication Service is running");
});

// Connect to MongoDB and then start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed", error);
  });
