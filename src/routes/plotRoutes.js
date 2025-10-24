const express = require("express");
const router = express.Router();
const { uploadExcel } = require("../middleware/upload");
const { uploadPlots, plotList } = require("../controllers/plotController");

router.post("/upload", uploadExcel.single("file"), uploadPlots);
router.get("/plotList", plotList);

module.exports = router;
