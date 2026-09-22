// =========================================================
// Token Generator Utility
// =========================================================

const jwt = require("jsonwebtoken");

function generateToken(customer) {
  return jwt.sign(
    {
      id: customer._id,
      email: customer.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

module.exports = generateToken;
