const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updateUser,
  deleteUser,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/createUser", authMiddleware, signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/updateUser/:id", authMiddleware, updateUser);
router.delete("/deleteUser/:id", authMiddleware, deleteUser);

module.exports = router;
