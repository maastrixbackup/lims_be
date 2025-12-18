const Khata = require("../models/khataModel");
const Project = require("../models/projectModel");
const Village = require("../models/villageModel");
const Plot = require("../models/plotModel");
const logAction = require("../utils/logger");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

async function addKhata(req, res) {
  const userId = req.user.id;
  const { project_id, village_id, khata_no, type } = req.body;
  const safeRequestPayload = req.body;
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

    const unique_id = `${project.client_code}/${village.village_code}/${khata_no}`;

    const existsUniqueId = await Khata.existsByUniqueId(unique_id);
    if (existsUniqueId) {
      return res.status(400).json({
        success: false,
        message: `Khata with unique_id '${unique_id}' already exists`,
      });
    }

    const khata = await Khata.create(
      project_id,
      village_id,
      khata_no,
      type,
      unique_id
    );
    await logAction(
      userId,
      "create khata",
      "success",
      "Khata created successfully",
      safeRequestPayload,
      khata
    );

    return res.status(201).json({
      success: true,
      message: "Khata created successfully",
      khata,
    });
  } catch (err) {
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
}

const khataList = async (req, res) => {
  
  try {
    // let { project_id, village_id, type, page = 1, limit = 10 } = req.query;
    // if (village_id) {
    //   village_id = village_id.split(",").map((id) => parseInt(id.trim()));
    // }
    let { project_id, village_id, type, page = 1, limit = 10 } = req.query;

    // if (village_id && village_id.trim() !== "") {
    //   village_id = village_id
    //     .split(",")
    //     .map((id) => parseInt(id.trim()))
    //     .filter((id) => !isNaN(id));
    // } else {
    //   village_id = null;
    // }
    if (typeof village_id === "string") {
      village_id = village_id
        .split(",")
        .map((v) => Number(v))
        .filter((v) => Number.isInteger(v));
    }

    if (!Array.isArray(village_id) || village_id.length === 0) {
      village_id = null;
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;
    const khatas = await Khata.findAll({
      project_id,
      village_id,
      type,
      limit,
      offset,
    });

    const total = await Khata.paginationCountAll({
      project_id,
      village_id,
      type,
    });

    return res.status(200).json({
      success: true,
      message: "Khata list fetched successfully",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      khatas,
    });
  } catch (err) {
    console.error("KHATA ERROR FULL:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
      sqlMessage: err.sqlMessage,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sql: err.sql,
    });
  }
};

const updateKhata = async (req, res) => {
  const userId = req.user.id;
  const khataId = req.params.id;
  const { project_id, village_id, khata_no, type } = req.body;
  const safeRequestPayload = req.body;

  try {
    const existingKhata = await Khata.findById(khataId);
    if (!existingKhata) {
      return res.status(404).json({
        success: false,
        message: "Khata not found",
      });
    }
    const updatedKhata = await Khata.update(
      khataId,
      project_id,
      village_id,
      khata_no,
      type
    );
    await logAction(
      userId,
      "update khata",
      "success",
      "Khata updated successfully",
      safeRequestPayload,
      updatedKhata
    );

    return res.status(200).json({
      success: true,
      message: "Khata updated successfully",
      khata: updatedKhata,
    });
  } catch (err) {
    await logAction(
      userId,
      "update khata",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );
    console.error("Update Khata Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteKhata = async (req, res) => {
  const userId = req.user.id;
  const khataId = req.params.id;

  try {
    const existingKhata = await Khata.findById(khataId);
    if (!existingKhata) {
      return res.status(404).json({
        success: false,
        message: "Khata not found",
      });
    }
    await Khata.delete(khataId);
    await logAction(
      userId,
      "delete khata",
      "success",
      "Khata deleted successfully",
      { id: khataId },
      null
    );

    return res.status(200).json({
      success: true,
      message: "Khata deleted successfully",
    });
  } catch (err) {
    await logAction(
      userId,
      "delete khata",
      "failure",
      err.message,
      { id: khataId },
      null
    );
    console.error("Delete Khata Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const uploadKhataDoc = async (req, res) => {
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
    const khataData = await Khata.findById(khata_id);
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
      "upload khata document",
      "success",
      "Khata uploaded successfully",
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
      "upload khata document",
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
    const documents = await Khata.getFilesByKhataId(khata_id);
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
      url: `${req.protocol}://${req.get("host")}${
        req.get("host").includes("localhost") ? "" : "/api"
      }/uploads/khata/${doc.file_name}`,
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

const deleteKhataFileById = async (req, res) => {
  const userId = req.user.id;
  const file_id = req.params.id;
  try {
    const document = await Khata.findFileById(file_id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    const deleted = await Khata.deleteFileById(file_id);
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete document from database.",
      });
    }
    const filePath = path.join(
      __dirname,
      "../../uploads/khata",
      document.file_name
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await logAction(
      userId,
      "delete khata document",
      "success",
      "Document deleted successfully",
      { file_id },
      deleted
    );
    return res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (err) {
    await logAction(
      userId,
      "delete khata document",
      "failure",
      err.message,
      { file_id },
      null
    );
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
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

    const khataData = await Khata.findById(khata_id);
    if (!khataData) {
      return res.status(404).json({
        success: false,
        message: "Khata not found",
      });
    }
    const { khata_no, project_id } = khataData;

    const plots = await Plot.findByKhataNo(khata_no, type, project_id);
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

const exportKhata = async (req, res) => {
  const userId = req.user.id;
  try {
    let { project_id, village_id, type } = req.query;
    if (village_id) {
      village_id = village_id.split(",").map((id) => parseInt(id.trim()));
    }

    const khata = await Khata.findAll({
      project_id,
      village_id,
      type,
      limit: 999999,
      offset: 0,
    });

    const khataTypeMap = {
      1: "Private Land",
      2: "Govt Land",
      3: "Forest Land",
    };

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Khata Report");

    sheet.addRow([
      "Sl/No",
      "Project Name",
      "Village Name",
      "Khata No",
      "Khata Type",
      "Unique ID",
      "Plot Count",
      "Created At",
      "Updated At",
    ]);

    khata.forEach((k, index) => {
      sheet.addRow([
        index + 1,
        k.project_name,
        k.village_name,
        k.khata_no,
        khataTypeMap[k.type] || "N/A",
        k.unique_id,
        k.plot_count,
        k.created_at,
        k.updated_at,
      ]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=khata_report.xlsx"
    );
    await workbook.xlsx.write(res);
    res.end();
    await logAction(
      userId,
      "export khata",
      "success",
      "Khata exported successfully",
      null,
      null
    );
  } catch (err) {
    await logAction(userId, "export khata", "failure", err.message, null, null);
    console.error("Export Khata Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to export khata",
    });
  }
};

// const printKhata = async (req, res) => {
//   const userId = req.user.id;
//   try {
//     let { project_id, village_id, type } = req.query;

//     if (village_id) {
//       village_id = village_id.split(",").map((id) => parseInt(id.trim()));
//     }

//     const khata = await Khata.findAll({
//       project_id,
//       village_id,
//       type,
//       limit: 999999,
//       offset: 0,
//     });

//     const khataTypeMap = {
//       1: "Private Land",
//       2: "Govt Land",
//       3: "Forest Land",
//     };

//     const doc = new PDFDocument({ margin: 40 });
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", "attachment; filename=khata_list.pdf");

//     doc.pipe(res);

//     doc.fontSize(20).text("Khata List", { align: "center" });
//     doc.moveDown();

//     doc
//       .fontSize(12)
//       .text(
//         "Sl/No | Project Name | Village Name | Khata No | Khata Type | Unique ID | Plot Count | Created At | Updated At",
//         {
//           underline: true,
//         }
//       );
//     doc.moveDown(0.5);

//     khata.forEach((k, index) => {
//       doc.text(
//         `${index + 1} | ${k.project_name} | ${k.village_name} | ${
//           k.khata_no
//         } | ${khataTypeMap[k.type]} | ${k.unique_id} | ${k.plot_count} | ${
//           k.created_at
//         } | ${k.updated_at}`
//       );
//     });

//     doc.end();

//     await logAction(
//       userId,
//       "print khata list",
//       "success",
//       "Khata list printed successfully",
//       { project_id, village_id, type },
//       null
//     );
//   } catch (err) {
//     await logAction(
//       userId,
//       "print khata list",
//       "failure",
//       err.message,
//       null,
//       null
//     );

//     console.error("Print Khata List Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to generate Khata List PDF",
//     });
//   }
// };

const printKhata = async (req, res) => {
  const userId = req.user.id;

  try {
    let { project_id, village_id, type } = req.query;

    if (village_id) {
      village_id = village_id.split(",").map((id) => parseInt(id.trim()));
    }

    const khata = await Khata.findAll({
      project_id,
      village_id,
      type,
      limit: 999999,
      offset: 0,
    });

    const khataTypeMap = {
      1: "Private Land",
      2: "Government Land",
      3: "Forest Land",
    };

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=khata_list.pdf");

    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Khata List", { align: "center" });
    doc.moveDown();

    // Table Header
    const headers = [
      "Sl",
      "Project",
      "Village",
      "Khata No",
      "Type",
      "Unique ID",
      "Plots",
      "Created",
      "Updated",
    ];

    const colWidths = [30, 80, 80, 70, 80, 120, 50, 70, 70];

    doc.fontSize(12).font("Helvetica-Bold");
    let y = doc.y;

    headers.forEach((header, i) => {
      doc.text(
        header,
        40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
        y,
        {
          width: colWidths[i],
        }
      );
    });

    doc.moveDown(0.5);
    doc.font("Helvetica");

    // Table Rows
    khata.forEach((k, index) => {
      const row = [
        index + 1,
        k.project_name,
        k.village_name,
        k.khata_no,
        khataTypeMap[k.type],
        k.unique_id,
        k.plot_count,
        formatDate(k.created_at),
        formatDate(k.updated_at),
      ];

      let currentY = doc.y;

      row.forEach((col, i) => {
        doc.text(
          col,
          40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
          currentY,
          {
            width: colWidths[i],
          }
        );
      });

      doc.moveDown(0.5);
    });

    doc.end();

    await logAction(
      userId,
      "print khata list",
      "success",
      "Khata list printed successfully",
      { project_id, village_id, type },
      null
    );
  } catch (err) {
    await logAction(
      userId,
      "print khata list",
      "failure",
      err.message,
      null,
      null
    );

    console.error("Print Khata List Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate Khata List PDF",
    });
  }
};

// Helper: clean date format
function formatDate(date) {
  return new Date(date).toLocaleString("en-IN");
}

const uploadMapDoc = async (req, res) => {
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

    const khataData = await Khata.findById(khata_id);
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
      "upload khata map document",
      "success",
      "Map file uploaded successfully",
      { khata_id },
      uploadedDocument
    );

    res.status(200).json({
      success: true,
      message: "Map file uploaded successfully",
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    await logAction(
      userId,
      "upload khata map document",
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

const getMapFiles = async (req, res) => {
  try {
    const { khata_id } = req.params;

    if (!khata_id) {
      return res.status(400).json({
        success: false,
        message: "Khata ID is required",
      });
    }

    const khataData = await Khata.findById(khata_id);
    if (!khataData) {
      return res.status(404).json({
        success: false,
        message: "Khata not found",
      });
    }

    const documents = await Khata.getMapDocumentsByKhataId(khata_id);
    const baseURL = `${req.protocol}://${req.get("host")}${
      req.get("host").includes("localhost") ? "" : "/api"
    }`;
    const formatted = documents.map((doc) => ({
      id: doc.id,
      khata_id: doc.khata_id,
      land_type: doc.land_type,
      file_name: doc.file_name,
      url: `${baseURL}/uploads/maps/${doc.file_name}`,
      uploaded_at: doc.created_at,
    }));
    return res.status(200).json({
      success: true,
      message: "Map documents fetched successfully",
      data: formatted,
    });
  } catch (err) {
    console.error("Fetch map doc error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching map files",
    });
  }
};

module.exports = {
  addKhata,
  khataList,
  updateKhata,
  deleteKhata,
  uploadKhataDoc,
  getKhataFilesByKhataId,
  deleteKhataFileById,
  viewPlotsByKhata,
  exportKhata,
  printKhata,
  uploadMapDoc,
  getMapFiles,
};
