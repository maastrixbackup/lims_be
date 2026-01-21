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
      khata,
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
      null,
    );
    console.error("Create Khata Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const govtKhataList = async (req, res) => {
  try {
    let {
      project_id,
      type,
      village_id,
      khata_no,
      page = 1,
      limit = 10,
    } = req.query;

    if (!project_id || !type) {
      return res.status(400).json({
        success: false,
        message: "project_id and type are required",
      });
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const result = await GovtKhata.findAll({
      project_id,
      type,
      village_id,
      khata_no,
      limit,
      offset,
    });

    const totalPages = Math.ceil(result.total / limit);

    return res.status(200).json({
      success: true,
      message: "Govt khata list fetched successfully",
      page,
      limit,
      total: result.total,
      totalPages,
      data: result.data,
    });
  } catch (err) {
    console.error("Govt Khata List Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateGovtKhata = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Khata id is required",
    });
  }

  const data = { ...req.body };

  // normalize empty values
  Object.keys(data).forEach((key) => {
    if (data[key] === "" || data[key] === undefined) {
      data[key] = null;
    }
  });

  try {
    // existing khata
    const existingKhata = await GovtKhata.findById(id);
    if (!existingKhata) {
      return res.status(404).json({
        success: false,
        message: "Govt khata not found",
      });
    }

    // do not allow changing project_id & type
    delete data.project_id;
    delete data.type;

    // duplicate check (if khata_no or village_id changes)
    if (
      (data.khata_no && data.khata_no !== existingKhata.khata_no) ||
      (data.village_id && data.village_id !== existingKhata.village_id)
    ) {
      const exists = await GovtKhata.existsKhata({
        project_id: existingKhata.project_id,
        type: existingKhata.type,
        village_id: data.village_id || existingKhata.village_id,
        khata_no: data.khata_no || existingKhata.khata_no,
        excludeId: id,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message:
            "Khata with same project, village and khata number already exists",
        });
      }
    }

    // update
    const updatedKhata = await GovtKhata.updateKhataById(id, data);

    await logAction(
      userId,
      "edit govt khata",
      "success",
      "Govt khata updated successfully",
      req.body,
      updatedKhata,
    );

    return res.status(200).json({
      success: true,
      message: "Govt khata updated successfully",
      khata: updatedKhata,
    });
  } catch (err) {
    await logAction(
      userId,
      "edit govt khata",
      "failure",
      err.message,
      req.body,
      null,
    );

    console.error("Edit Govt Khata Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteGovtKhata = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Khata id is required",
      });
    }

    //Check khata exists
    const existingKhata = await GovtKhata.findById(id);
    if (!existingKhata) {
      return res.status(404).json({
        success: false,
        message: "Govt khata not found",
      });
    }

    await GovtKhata.deleteKhataById(id);

    await logAction(
      userId,
      "delete govt khata",
      "success",
      "Govt khata permanently deleted",
      { id },
      existingKhata,
    );

    return res.status(200).json({
      success: true,
      message: "Govt khata deleted successfully",
    });
  } catch (err) {
    await logAction(
      userId,
      "delete govt khata",
      "failure",
      err.message,
      { id },
      null,
    );

    console.error("Delete Govt Khata Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  addGovtKhata,
  govtKhataList,
  updateGovtKhata,
  deleteGovtKhata,
};
