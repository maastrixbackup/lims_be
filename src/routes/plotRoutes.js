const express = require("express");
const router = express.Router();
const db = require("../config/db");
const {
  uploadPlotExcel,
  uploadLandCostPayment,
  // uploadGovtPlotAttachments,
} = require("../middleware/upload");
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
  plotDocumentDelete,
  landCostPaymentUpload,
  updatePlotPayment,
  markPaymentCompleted,
  downloadPlotDocument,
} = require("../controllers/plotController");
// const { addGovtPlot } = require("../controllers/govtPlotController");

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
router.delete("/plotDocumentDelete/:fileName", plotDocumentDelete);
router.get("/plotDocumentDownload/:filename", downloadPlotDocument);
router.post(
  "/landCostPaymentUpload",
  uploadLandCostPayment.single("payment_proof"),
  landCostPaymentUpload
);
router.put("/updatePlotPayment/:id", updatePlotPayment);

router.put("/paymentCompleted", markPaymentCompleted);
// router.post("/addGovtPlot/", addGovtPlot);

// router.post(
//   "/addGovtPlot",
//   uploadGovtPlotAttachments.fields([
//     { name: "ri_report_attachment", maxCount: 1 },
//     { name: "tree_enumeration_attachment", maxCount: 1 },
//     { name: "lease_to_idco_attachment", maxCount: 1 },
//     { name: "lease_to_ua_attachment", maxCount: 1 },
//   ]),
//   addGovtPlot
// );

router.delete("/truncate-db", async (req, res) => {
  try {
    await db.query("SET FOREIGN_KEY_CHECKS = 0");

    await db.query("TRUNCATE TABLE forest_land_schedule");
    await db.query("TRUNCATE TABLE forest_project_master");
    await db.query("TRUNCATE TABLE govt_khata");
    await db.query("TRUNCATE TABLE govt_plots");
    await db.query("TRUNCATE TABLE govt_plot_documents");
    await db.query("TRUNCATE TABLE khatas");
    await db.query("TRUNCATE TABLE khata_documents");
    await db.query("TRUNCATE TABLE khata_map_documents");
    await db.query("TRUNCATE TABLE logs");
    await db.query("TRUNCATE TABLE plots");
    await db.query("TRUNCATE TABLE plot_payments");
    await db.query("TRUNCATE TABLE projects");
    await db.query("TRUNCATE TABLE pvt_plot_documents");
    await db.query("TRUNCATE TABLE villages");

    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    res.json({
      success: true,
      message: "Database truncated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error truncating database",
    });
  }
});

module.exports = router;
