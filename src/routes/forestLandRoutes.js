const express = require("express");
const router = express.Router();
const multer = require("multer");
const { addForestLand, updateForestLand } = require("../controllers/forestLandController");

router.post("/addForestLand", addForestLand);
router.put("/updateForestLand/:id", updateForestLand);

module.exports = router;
