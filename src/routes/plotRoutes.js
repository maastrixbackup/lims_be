const express = require("express");
const router = express.Router();
const { uploadPlotExcel } = require("../middleware/upload");
const { uploadPlots, plotList } = require("../controllers/plotController");

router.post("/upload", uploadPlotExcel.single("file"), uploadPlots);
router.get("/plotList", plotList);

module.exports = router;
