const express = require("express");
const router = express.Router();

const {usersList, changePassword} = require("../controllers/userController");

router.post("/changePassword", changePassword);
router.get("/usersList", usersList);

module.exports = router;
