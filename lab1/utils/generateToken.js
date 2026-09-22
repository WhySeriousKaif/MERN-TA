// Small helper function to create a JWT for a logged-in customer.

const jwt = require("jsonwebtoken");

function generateToken(customer) {
  // We only put non-sensitive data inside the JWT payload.
  const payload = {
    id: customer._id,
    email: customer.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d", // token is valid for 1 day
    
  });

  return token;
}

module.exports = generateToken;
