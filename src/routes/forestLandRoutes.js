const express = require("express");
const router = express.Router();
const multer = require("multer");
const { addForestLand, updateForestLand, forestLandList } = require("../controllers/forestLandController");

router.post("/addForestLand", addForestLand);
router.put("/updateForestLand/:id", updateForestLand);
router.get("/forestLandList", forestLandList);

module.exports = router;
