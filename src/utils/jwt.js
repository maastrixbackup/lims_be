const jwt = require("jsonwebtoken");

const generateToken = (user, expiresIn = "1h") => {
  return jwt.sign(
    { id: user.id, role_id: user.role_id, role_name: user.role_name },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
