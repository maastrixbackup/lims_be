const express = require("express");
const router = express.Router();

const {
  uploadGovtPlotAttachments,
  uploadGovtPlotExcel,
  uploadGovtLandCostPayment,
} = require("../middleware/upload");

const {
  addGovtPlot,
  govtPlotList,
  uploadGovtPlot,
  deleteGovtPlot,
  govtPlotDocumentList,
  govtPlotDocumentDelete,
  updateGovtPlot,
  downloadPlotDocument,
  paymentReady,
  getAllPaymentReady,
  landCostPaymentUpload,
  updatePlotPayment,
  markPaymentCompleted
} = require("../controllers/govtPlotController");

//Routes
router.post(
  "/addGovtPlot",
  uploadGovtPlotAttachments.fields([
    { name: "ri_report_attachment", maxCount: 1 },
    { name: "tree_enumeration_attachment", maxCount: 1 },
    { name: "lease_to_idco_attachment", maxCount: 1 },
    { name: "lease_to_ua_attachment", maxCount: 1 },
  ]),
  addGovtPlot
);

router.get("/govtPlotList", govtPlotList);
router.post(
  "/uploadGovtPlotExcel",
  uploadGovtPlotExcel.single("file"),
  uploadGovtPlot
);
router.delete("/deleteGovtPlot/:id", deleteGovtPlot);
router.get("/govtPlotDocumentList", govtPlotDocumentList);
router.delete("/govtPlotDocumentDelete/:fileName", govtPlotDocumentDelete);
router.get("/govtPlotDocumentDownload/:filename", downloadPlotDocument);
// router.put("/updateGovtPlot/:id", updateGovtPlot);
router.put(
  "/updateGovtPlot/:id",
  uploadGovtPlotAttachments.fields([
    { name: "ri_report_attachment", maxCount: 1 },
    { name: "tree_enumeration_attachment", maxCount: 1 },
    { name: "lease_to_idco_attachment", maxCount: 1 },
    { name: "lease_to_ua_attachment", maxCount: 1 },
  ]),
  updateGovtPlot
);

router.post("/paymentReady", paymentReady);
router.get("/getCompensationDetails", getAllPaymentReady);
router.post(
  "/landCostPaymentUpload",
  uploadGovtLandCostPayment.single("payment_proof"),
  landCostPaymentUpload
);
router.put("/updatePlotPayment/:id", updatePlotPayment);
router.put("/paymentCompleted", markPaymentCompleted);

module.exports = router;
