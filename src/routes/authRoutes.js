const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updateUserByAdmin,
  deleteUser,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadProfilePic } = require("../middleware/upload");

router.post(
  "/createUser",
  authMiddleware,
  uploadProfilePic.single("profile_pic"),
  signup
);

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put(
  "/updateUser/:id",
  authMiddleware,
  uploadProfilePic.single("profile_pic"),
  updateUserByAdmin
);
router.delete("/deleteUser/:id", authMiddleware, deleteUser);

module.exports = router;
