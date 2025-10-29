const express = require("express");
const router = express.Router();
const { uploadPlotExcel } = require("../middleware/upload");
const {
  uploadPlots,
  plotList,
  createPlot,
  updatePlot,
  deletePlot,
} = require("../controllers/plotController");

router.post("/upload", uploadPlotExcel.single("file"), uploadPlots);
router.get("/plotList", plotList);
router.post("/createPlot", createPlot);
router.put("/updatePlot/:id", updatePlot);
router.delete("/deletePlot/:id", deletePlot);

module.exports = router;
