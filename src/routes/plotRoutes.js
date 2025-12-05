const express = require("express");
const router = express.Router();
const { uploadPlotExcel } = require("../middleware/upload");
const {
  uploadPlots,
  plotList,
  plotDocumentList,
  createPlot,
  updatePlot,
  deletePlot,
  getDeletedPlots,
  restorePlot,
  paymentReady,
  getAllPaymentReady,
  exportPlot,
} = require("../controllers/plotController");

router.post("/upload", uploadPlotExcel.single("file"), uploadPlots);
router.get("/plotList", plotList);
router.get("/plotDocumentList", plotDocumentList);
router.post("/createPlot", createPlot);
router.put("/updatePlot/:id", updatePlot);
router.delete("/deletePlot/:id", deletePlot);
router.get("/getDeletedPlots", getDeletedPlots);
router.put("/restorePlot/:id", restorePlot);
router.post("/paymentReady", paymentReady);
router.get("/getCompensationDetails", getAllPaymentReady);
router.get("/exportPlot", exportPlot);

module.exports = router;
