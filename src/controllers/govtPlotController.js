const xlsx = require("xlsx");
const GovtPlot = require("../models/govtPlotModel");
const path = require("path");
const fs = require("fs");

const logAction = require("../utils/logger");
// const Village = require("../models/villageModel");
// const Khata = require("../models/khataModel");
const ExcelJS = require("exceljs");

const addGovtPlot = async (req, res) => {
  //   console.log(123);
  const userId = req.user.id;
  const data = req.body;
  const files = req.files;

  const normalize = (value) =>
    value === "" || value === undefined ? null : value;

  Object.keys(data).forEach((key) => {
    data[key] = normalize(data[key]);
  });

  try {
    if (!data.project_id || !data.type) {
      return res.status(400).json({
        success: false,
        message: "Project id and type are required",
      });
    }

    if (data.ri_report === "Complete" && !files?.ri_report_attachment) {
      return res.status(400).json({
        success: false,
        message: "RI report attachment is required when RI Report is Complete",
      });
    }

    // if (data.misc_dr_case_prep == 1) {
    //   // No validation needed for number (optional)
    // }

    if (
      data.tree_enumeration === "Complete" &&
      !files?.tree_enumeration_attachment
    ) {
      return res.status(400).json({
        success: false,
        message: "Tree Enumeration report is required when status is Complete",
      });
    }

    if (data.lease_to_idco == "1" && !files?.lease_to_idco_attachment) {
      return res.status(400).json({
        success: false,
        message: "Lease attachment is required for IDCO",
      });
    }

    if (data.lease_to_ua == "1" && !files?.lease_to_ua_attachment) {
      return res.status(400).json({
        success: false,
        message: "Lease attachment is required for UA",
      });
    }

    data.ri_report_attachment = files?.ri_report_attachment?.[0]?.filename || null;

    data.tree_enumeration_attachment =
      files?.tree_enumeration_attachment?.[0]?.filename || null;

    data.lease_to_idco_attachment =
      files?.lease_to_idco_attachment?.[0]?.filename || null;

    data.lease_to_ua_attachment =
      files?.lease_to_ua_attachment?.[0]?.filename || null;

    const govtPlot = await GovtPlot.create(data);

    await logAction(
      userId,
      "add govt plot",
      "success",
      "Govt plot created successfully",
      req.body,
      govtPlot
    );

    return res.status(201).json({
      success: true,
      message: "Govt plot created successfully",
      govtPlot,
    });
  } catch (err) {
    await logAction(
      userId,
      "add govt plot",
      "failure",
      err.message,
      req.body,
      null
    );
    console.error("Add Govt Plot Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { addGovtPlot };
