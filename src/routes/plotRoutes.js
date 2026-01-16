const express = require("express");
const router = express.Router();
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

module.exports = router;
