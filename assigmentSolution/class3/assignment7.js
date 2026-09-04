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

// GET /users/:id
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).send("Internal server error");
  }
});

module.exports = { app, User };