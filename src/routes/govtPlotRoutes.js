const express = require("express");
const router = express.Router();

const {
  uploadGovtPlotAttachments,
  uploadGovtPlotExcel,
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

module.exports = router;
