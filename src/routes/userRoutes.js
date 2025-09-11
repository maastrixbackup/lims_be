const express = require("express");
const router = express.Router();

const {usersList, changePassword, updateUser } = require("../controllers/userController");

router.post("/changePassword", changePassword);
router.get("/usersList", usersList);
router.post("/updateUser", updateUser);

module.exports = router;
