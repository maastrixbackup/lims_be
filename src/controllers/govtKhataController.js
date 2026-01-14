const Khata = require("../models/khataModel");
const Project = require("../models/projectModel");
const Village = require("../models/villageModel");
const govtKhata = require("../models/govtKhataModel");
const Plot = require("../models/plotModel");
const logAction = require("../utils/logger");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const GovtKhata = require("../models/govtKhataModel");

const addGovtKhata = async (req, res) => {
  const userId = req.user.id;
  const safeRequestPayload = { ...req.body };

  Object.keys(safeRequestPayload).forEach((key) => {
    if (
      safeRequestPayload[key] === "" ||
      safeRequestPayload[key] === undefined
    ) {
      safeRequestPayload[key] = null;
    }
  });
  const {
    project_id,
    type,
    khata_no,
    village_id,
    kissam_of_land,
    plot_no,
    lease_case_no,
    present_status,
    case_details,
  } = safeRequestPayload;

  try {
    if (!project_id || !village_id || !khata_no || !type) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const village = await Village.findById(village_id);
    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    const khata = await GovtKhata.create({
      project_id,
      type,
      khata_no,
      village_id,
      kissam_of_land,
      plot_no,
      lease_case_no,
      present_status,
      case_details,
    });
    await logAction(
      userId,
      "create govt khata",
      "success",
      "Govt khata created successfully",
      safeRequestPayload,
      khata
    );

    return res.status(201).json({
      success: true,
      message: "Govt khata created successfully",
      khata,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message:
          "Khata with same project, village and khata number already exists",
      });
    }
    await logAction(
      userId,
      "create khata",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );
    console.error("Create Khata Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addGovtKhata,
};
