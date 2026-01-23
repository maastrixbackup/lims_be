const express = require("express");
const router = express.Router();
const multer = require("multer");
const { addForestLand, updateForestLand, forestLandList, deleteForestLand } = require("../controllers/forestLandController");

router.post("/addForestLand", addForestLand);
router.put("/updateForestLand/:id", updateForestLand);
router.get("/forestLandList", forestLandList);
router.delete("/deleteForestLand/:id", deleteForestLand);

module.exports = router;
