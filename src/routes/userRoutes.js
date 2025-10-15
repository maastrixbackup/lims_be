const express = require("express");
const router = express.Router();

const {
  usersList,
  changePassword,
  updateUser,
  getProfile,
} = require("../controllers/userController");

router.post("/changePassword", changePassword);
router.get("/usersList", usersList);
router.post("/updateUser", updateUser);
router.get("/getProfile", getProfile);

module.exports = router;
