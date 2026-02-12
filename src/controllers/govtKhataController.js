const Khata = require("../models/khataModel");
const Project = require("../models/projectModel");
const Village = require("../models/villageModel");
const govtKhata = require("../models/govtKhataModel");
const Plot = require("../models/plotModel");
const GovtPlot = require("../models/govtPlotModel");
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
    ror_name,
    land_category
  } = safeRequestPayload;

  try {
    if (!project_id || !type) { //village_id,khata_no changed to null in table
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

    // const village = await Village.findById(village_id);
    // if (!village) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Village not found",
    //   });
    // }

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
      ror_name,
      land_category
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

const viewPlotsByKhata = async (req, res) => {
  const khata_id = req.params.id;
  const { type } = req.query;
  try {
    if (!khata_id) {
      return res.status(400).json({
        success: false,
        message: "Khata ID is required",
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Plot type is required",
      });
    }

    const khataData = await GovtKhata.findById(khata_id);
    if (!khataData) {
      return res.status(404).json({
        success: false,
        message: "Khata not found",
      });
    }
    const { khata_no, project_id } = khataData;

    const plots = await GovtPlot.findByKhataNo(khata_no, type, project_id);
    return res.status(200).json({
      success: true,
      message: "Plots fetched successfully",
      data: {
        khata_no,
        total_plots: plots.length,
        plots,
      },
    });
  } catch (err) {
    console.error("View Plots Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const uploadGovtKhataDoc = async (req, res) => {
  const userId = req.user.id;
  const safeRequestPayload = req.body;
  try {
    const { khata_id, document_type } = req.body;
    if (!khata_id) {
      return res.status(400).json({
        success: false,
        message: "Khata id is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }
    const khataData = await govtKhata.findById(khata_id);
    if (!khataData) {
      return res.status(404).json({
        success: false,
        message: "Khata not found",
      });
    }
    const { unique_id, type } = khataData;
    const uploadedDocument = await Khata.uploadKhataDocument(
      khata_id,
      unique_id,
      req.file.filename,
      type,
      document_type
    );

    await logAction(
      userId,
      "upload Govt khata document",
      "success",
      "Govt Khata uploaded successfully",
      safeRequestPayload,
      uploadedDocument
    );
    return res.status(200).json({
      success: true,
      message: "Khata document uploaded successfully",
    });
  } catch (err) {
    console.error("Upload Khata Error:", err);
    await logAction(
      userId,
      "upload govt khata document",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getKhataFilesByKhataId = async (req, res) => {
  try {
    const khata_id = req.params.id;
    const documents = await govtKhata.getFilesByKhataId(khata_id);
    // const baseUrl = `${req.protocol}://${req.get("host")}`;

    // const documentsWithUrl = documents.map((doc) => ({
    //   ...doc,
    //   url: `${baseUrl}/uploads/khata/${doc.file_name}`,
    // }));

    const documentsWithUrl = documents.map((doc) => ({
      ...doc,
      // url: `${req.protocol}://${req.get("host")}${prefix}/uploads/khata/${
      //   doc.file_name
      // }`,
      url: `${req.protocol}://${req.get("host")}${req.get("host").includes("localhost") ? "" : "/api"
        }/uploads/govt_khata/${doc.file_name}`,
    }));
    res.status(200).json({
      success: true,
      message: "Khata documents fetched successfully.",
      count: documentsWithUrl.length,
      documentsWithUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }

};

const uploadGovtMapDoc = async (req, res) => {
  const userId = req.user.id;
  try {
    const { khata_id } = req.body;

    if (!khata_id) {
      return res.status(400).json({
        success: false,
        message: "khata ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const khataData = await govtKhata.findById(khata_id);
    if (!khataData) {
      return res.status(404).json({
        success: false,
        message: "Khata not found",
      });
    }
    const { type } = khataData;

    const uploadedDocument = await Khata.addMapDocument(
      khata_id,
      type,
      req.file.filename
    );

    await logAction(
      userId,
      "upload govt khata map document",
      "success",
      "Govt Map file uploaded successfully",
      { khata_id },
      uploadedDocument
    );

    res.status(200).json({
      success: true,
      message: "Govt Map file uploaded successfully",
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    await logAction(
      userId,
      "Govt upload khata map document",
      "failure",
      err.message,
      null,
      null
    );
    res.status(500).json({
      success: false,
      message: "Failed to upload map document",
    });
  }
};

module.exports = {
  addGovtKhata,
  govtKhataList,
  updateGovtKhata,
  deleteGovtKhata,
  viewPlotsByKhata,
  uploadGovtKhataDoc,
  getKhataFilesByKhataId,
  uploadGovtMapDoc
};
