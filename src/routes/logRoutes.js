const express = require("express");
const router = express.Router();

const { getLogs } = require("../controllers/logController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/logList", authMiddleware, getLogs);

module.exports = router;
