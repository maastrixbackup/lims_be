const express = require("express");
const router = express.Router();

const { uploadGovtPlotAttachments } = require("../middleware/upload");

const { addGovtPlot } = require("../controllers/govtPlotController");

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

module.exports = router;
