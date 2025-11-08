const express = require("express");
const router = express.Router();

const {
  usersList,
  changePassword,
  updateUser,
  getProfile,
} = require("../controllers/userController");

const { uploadProfilePic } = require("../middleware/upload");

router.post("/changePassword", changePassword);
router.get("/usersList", usersList);
router.post("/updateUser", uploadProfilePic.single("profile_pic"), updateUser);
router.get("/getProfile", getProfile);

module.exports = router;
