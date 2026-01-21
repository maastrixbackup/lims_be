const express = require("express");
const router = express.Router();
const multer = require("multer");
const { addForestLand } = require("../controllers/forestLandController");

router.post("/addForestLand", addForestLand);

module.exports = router;
