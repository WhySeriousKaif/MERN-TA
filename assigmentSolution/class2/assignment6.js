const express = require("express");

const app = express();

app.get("/greet", (req, res) => {
  const name = req.query.name;

  if (name) {
    return res.send(`Hello, ${name}!`);
  }

  return res.send("Hello, Guest!");
});

module.exports = app;