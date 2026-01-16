const xlsx = require("xlsx");
const GovtPlot = require("../models/govtPlotModel");
const GovtVillage = require("../models/govtVillageModel");
const GovtKhata = require("../models/govtKhataModel");
const path = require("path");
const fs = require("fs");

const logAction = require("../utils/logger");
// const Village = require("../models/villageModel");
// const Khata = require("../models/khataModel");
const ExcelJS = require("exceljs");

// const uploadGovtPlot = async (req, res) => {
//   try {
//     const { project_id, type } = req.body;

//     if (!project_id || !type) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and type are required",
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel file is required",
//       });
//     }

//     const workbook = xlsx.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
//       defval: null,
//     });
//     console.log("Rows name", rows);

//     if (!rows.length) {
//       fs.unlinkSync(req.file.path);
//       return res.status(400).json({
//         success: false,
//         message: "Excel file is empty",
//       });
//     }

//     await GovtPlot.bulkInsertFromExcel(rows, project_id, type);
//     await GovtKhata.upsertFromExcel(rows);

//     fs.unlinkSync(req.file.path);

//     return res.status(201).json({
//       success: true,
//       message: "Govt plots & khatas uploaded successfully",
//     });
//   } catch (err) {
//     console.error("Govt Plot Excel Upload Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

const uploadGovtPlot = async (req, res) => {
  const userId = req.user.id;
  try {
    const { project_id, type } = req.body;

    if (!project_id || !type) {
      return res.status(400).json({
        success: false,
        message: "project_id and type are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];

    if (workbook.SheetNames.length !== 1) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Invalid Excel format. Only ONE sheet is allowed inside file.",
      });
    }

    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: null,
    });

    const normalizeKey = (key) =>
      key?.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

    // normalize headers
    const rows = rawRows.map((r) => {
      const obj = {};
      for (const k in r) {
        obj[normalizeKey(k)] = r[k];
      }
      return obj;
    });

    const REQUIRED_HEADERS = ["mouza", "tahasil", "khata no", "plot no"];
    const excelHeaders = Object.keys(rows[0]);

    const missingHeaders = REQUIRED_HEADERS.filter(
      (h) => !excelHeaders.includes(h)
    );

    if (missingHeaders.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `Invalid Excel format. Missing columns: ${missingHeaders.join(
          ", "
        )}`,
      });
    }
    // console.log("Header name", rows);
    const villageMap = await GovtVillage.upsertFromExcel(
      rows,
      project_id,
      type
    );

    // 2️⃣ govt_khata
    const khataMap = await GovtKhata.upsertFromExcel(
      rows,
      villageMap,
      project_id,
      type
    );

    await GovtPlot.bulkInsertFromExcel(rows, project_id, type);
    // await GovtKhata.upsertFromExcel(rows);

    await GovtPlot.insertDocument({
      project_id,
      type,
      filename: req.file.filename,
      original_filename: req.file.originalname,
      file_path: `uploads/govt_plot_excels/${req.file.filename}`,
      uploaded_by: userId,
    });

    await logAction(
      userId,
      "Govt plot excel upload",
      "success",
      "Govt plots inserted successfully",
      { project_id },
      null
    );

    return res.status(201).json({
      success: true,
      message: "Govt plot excel uploaded successfully",
    });
  } catch (err) {
    await logAction(
      userId,
      "Govt plot excel upload",
      "failure",
      err.message,
      null,
      null
    );
    console.error("Govt Plot Excel Upload Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const addGovtPlot = async (req, res) => {
  const userId = req.user.id;
  const data = req.body || {};
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

    data.ri_report_attachment =
      files?.ri_report_attachment?.[0]?.filename || null;

    data.tree_enumeration_attachment =
      files?.tree_enumeration_attachment?.[0]?.filename || null;

    data.lease_to_idco_attachment =
      files?.lease_to_idco_attachment?.[0]?.filename || null;

    data.lease_to_ua_attachment =
      files?.lease_to_ua_attachment?.[0]?.filename || null;

    const rows = [
      {
        mouza: data.mouza,
        tahasil: data.tahasil,
        "khata no": data.khata_no,
        "plot no": data.plot_no,
        "kissam of land": data.kissam || null,
        "lease case no": data.lease_case_no || null,
        "case details/ deservation req.": data.case_details || null,
      },
    ];
    // Village upsert
    const villageMap = await GovtVillage.upsertFromExcel(
      rows,
      data.project_id,
      data.type
    );

    const villageKey = `${data.mouza}_${data.tahasil}`;
    const villageId = villageMap[villageKey];

    if (!villageId) {
      return res.status(400).json({
        success: false,
        message: "Unable to create/find village",
      });
    }

    // Khata upsert
    const khataMap = await GovtKhata.upsertFromExcel(
      rows,
      villageMap,
      data.project_id,
      data.type
    );

    const khataKey = `${villageId}_${data.khata_no}`;
    const khataId = khataMap[khataKey] || null;

    // data.village_id = villageId;
    // data.khata_id = khataId;
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

const govtPlotList = async (req, res) => {
  try {
    let { page = 1, limit = 10, project_id, type } = req.query;

    if (!project_id || !type) {
      return res.status(400).json({
        success: false,
        message: "project id and type is required",
      });
    }

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const result = await GovtPlot.findAll({
      project_id,
      type,
      limit,
      offset,
    });

    const buildFileUrl = (req, folder, fileName) => {
      if (!fileName) return null;

      const base = req.get("host").includes("localhost")
        ? `${req.protocol}://${req.get("host")}`
        : `${req.protocol}://${req.get("host")}/api`;

      return `${base}/uploads/${folder}/${fileName}`;
    };

    // const dataWithUrls = result.data.map((plot) => ({
    //   ...plot,
    //   ri_report_attachment: buildFileUrl(
    //     req,
    //     "govt_plots",
    //     plot.ri_report_attachment
    //   ),
    //   tree_enumeration_attachment: buildFileUrl(
    //     req,
    //     "govt_plots",
    //     plot.tree_enumeration_attachment
    //   ),
    //   lease_to_idco_attachment: buildFileUrl(
    //     req,
    //     "govt_plots",
    //     plot.lease_to_idco_attachment
    //   ),
    //   lease_to_ua_attachment: buildFileUrl(
    //     req,
    //     "govt_plots",
    //     plot.lease_to_ua_attachment
    //   ),
    // }));

    const PRESENT_STATUS_MAP = {
      1: "Lease Case to Sub-Collector",
      2: "Lease Case to ADM (Rev.Sec)",
      3: "Demand Raised",
      4: "Lease Sanctioned by Collector",
    };
    const dataWithUrls = result.data.map((plot) => ({
      ...plot,

      present_status_text: PRESENT_STATUS_MAP[plot.present_status] || "N/A",

      ri_report_attachment: plot.ri_report_attachment
        ? {
            file_name: plot.ri_report_attachment,
            url: buildFileUrl(req, "govt_plots", plot.ri_report_attachment),
          }
        : null,

      tree_enumeration_attachment: plot.tree_enumeration_attachment
        ? {
            file_name: plot.tree_enumeration_attachment,
            url: buildFileUrl(
              req,
              "govt_plots",
              plot.tree_enumeration_attachment
            ),
          }
        : null,

      lease_to_idco_attachment: plot.lease_to_idco_attachment
        ? {
            file_name: plot.lease_to_idco_attachment,
            url: buildFileUrl(req, "govt_plots", plot.lease_to_idco_attachment),
          }
        : null,

      lease_to_ua_attachment: plot.lease_to_ua_attachment
        ? {
            file_name: plot.lease_to_ua_attachment,
            url: buildFileUrl(req, "govt_plots", plot.lease_to_ua_attachment),
          }
        : null,
    }));

    return res.status(200).json({
      success: true,
      message: "Govt plots fetched successfully",
      page,
      limit,
      total: result.total,
      data: dataWithUrls,
    });
  } catch (err) {
    console.error("Govt Plot Listing Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteGovtPlot = async (req, res) => {
  const userId = req.user.id;
  const plotId = req.params.id;

  try {
    const deleted = await GovtPlot.govtPlotDelete(plotId);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Plot not found" });
    }
    await logAction(
      userId,
      "delete govt plot",
      "success",
      "Govt plot soft deleted",
      { plotId },
      null
    );

    return res
      .status(200)
      .json({ success: true, message: "Plot soft deleted successfully" });
  } catch (err) {
    await logAction(
      userId,
      "delete govt plot",
      "failure",
      err.message,
      { plotId },
      null
    );
    res.status(500).json({ success: false, message: err.message });
  }
};

// const govtPlotDocumentList = async (req, res) => {
//   try {
//     const uploadsDir = path.join(process.cwd(), "uploads/govt_plot_excels");

//     if (!fs.existsSync(uploadsDir)) {
//       return res.status(200).json({
//         success: true,
//         message: "Govt plot documents directory not found",
//         files: [],
//       });
//     }

//     const files = fs.readdirSync(uploadsDir);

//     const excelFiles = files.filter((f) => f.match(/\.(xls|xlsx)$/i));

//     if (excelFiles.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No Excel files found",
//         files: [],
//       });
//     }

//     const fileList = excelFiles.map((file) => {
//       const filePath = path.join(uploadsDir, file);
//       const stats = fs.statSync(filePath);

//       return {
//         name: file,
//         // size: `${(stats.size / 1024).toFixed(2)} KB`,
//         uploadedAt: stats.mtime,
//         documentUrl: `${req.protocol}://${req.get("host")}${
//           req.get("host").includes("localhost") ? "" : "/api"
//         }/uploads/govt_plot_excels/${file}`,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       total: fileList.length,
//       files: fileList,
//     });
//   } catch (err) {
//     console.error("Govt Plot Document List Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching govt plot documents",
//     });
//   }
// };

const govtPlotDocumentList = async (req, res) => {
  try {
    const { project_id, type } = req.query;

    const rows = await GovtPlot.findAllDocuments({
      project_id,
      type,
    });

    const files = rows.map((r) => ({
      id: r.id,
      project_id: r.project_id,
      type: r.type,
      name: r.original_filename,
      uploadedAt: r.created_at,
      // documentUrl: `${req.protocol}://${req.get("host")}${
      //   req.get("host").includes("localhost") ? "" : "/api"
      // }/plot-documents/download/${r.filename}`,

      documentUrl: `${req.protocol}://${req.get("host")}${
        req.get("host").includes("localhost") ? "" : "/api"
      }/uploads/govt_plot_excels/${r.filename}`,
    }));

    return res.json({
      success: true,
      total: files.length,
      files,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch plot documents",
    });
  }
};

// const downloadPlotDocument = async (req, res) => {
//   try {
//     const { filename } = req.params;

//     const uploadsDir = path.join(process.cwd(), "uploads/govt_plot_excels");
//     const filePath = path.join(uploadsDir, filename);

//     // Security check
//     if (!filename || filename.includes("..")) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid file name",
//       });
//     }

//     // File exists?
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({
//         success: false,
//         message: "File not found",
//       });
//     }

//     // Set headers (VERY IMPORTANT for Chrome)
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

//     // Stream file
//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);
//   } catch (error) {
//     console.error("Download error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error while downloading file",
//     });
//   }
// };

const downloadPlotDocument = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename || filename.includes("..")) {
      return res.status(400).json({
        success: false,
        message: "Invalid file request",
      });
    }

    // Get document from DB
    const doc = await GovtPlot.findDocumentByFilename(filename);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Build safe path from DB
    const filePath = path.join(process.cwd(), doc.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File missing on server",
      });
    }

    // Set headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${doc.original_filename || doc.filename}"`
    );

    // Stream file
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while downloading file",
    });
  }
};

const govtPlotDocumentDelete = async (req, res) => {
  const userId = req.user.id;

  try {
    const { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: "File name is required",
      });
    }

    // ✅ allow only Excel files
    // if (!/\.(xls|xlsx)$/i.test(fileName)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid file format. Only Excel files can be deleted",
    //   });
    // }

    const filePath = path.join(
      process.cwd(),
      "uploads/govt_plot_excels",
      fileName
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    fs.unlinkSync(filePath);

    await logAction(
      userId,
      "govt plot excel delete",
      "success",
      "Govt plot Excel file deleted successfully",
      { fileName },
      null
    );

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
      deletedFile: fileName,
    });
  } catch (err) {
    console.error("Govt Plot Excel Delete Error:", err);

    await logAction(
      userId,
      "govt plot excel delete",
      "failed",
      "Failed to delete govt plot Excel file",
      null,
      err.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error while deleting govt plot Excel file",
    });
  }
};

const updateGovtPlot = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // govt_plot id

  const data = req.body || {};
  const files = req.files || {};

  const normalize = (value) =>
    value === "" || value === undefined ? null : value;

  Object.keys(data).forEach((key) => {
    data[key] = normalize(data[key]);
  });

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Govt plot id is required",
      });
    }

    // if (!data.project_id || !data.type) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Project id and type are required",
    //   });
    // }
    if (data.project_id !== undefined && !data.project_id) {
      return res.status(400).json({ message: "Project id is required" });
    }

    // 🔍 check existing plot
    const existingPlot = await GovtPlot.findByPk(id);
    if (!existingPlot) {
      return res.status(404).json({
        success: false,
        message: "Govt plot not found",
      });
    }

    if (
      data.ri_report === "Complete" &&
      !files?.ri_report_attachment &&
      !existingPlot.ri_report_attachment
    ) {
      return res.status(400).json({
        success: false,
        message: "RI report attachment is required when RI Report is Complete",
      });
    }

    if (
      data.tree_enumeration === "Complete" &&
      !files?.tree_enumeration_attachment &&
      !existingPlot.tree_enumeration_attachment
    ) {
      return res.status(400).json({
        success: false,
        message: "Tree Enumeration report is required when status is Complete",
      });
    }

    if (
      data.lease_to_idco == "1" &&
      !files?.lease_to_idco_attachment &&
      !existingPlot.lease_to_idco_attachment
    ) {
      return res.status(400).json({
        success: false,
        message: "Lease attachment is required for IDCO",
      });
    }

    if (
      data.lease_to_ua == "1" &&
      !files?.lease_to_ua_attachment &&
      !existingPlot.lease_to_ua_attachment
    ) {
      return res.status(400).json({
        success: false,
        message: "Lease attachment is required for UA",
      });
    }

    // attachments (keep old if new not uploaded)
    data.ri_report_attachment =
      files?.ri_report_attachment?.[0]?.filename ??
      existingPlot.ri_report_attachment;

    data.tree_enumeration_attachment =
      files?.tree_enumeration_attachment?.[0]?.filename ??
      existingPlot.tree_enumeration_attachment;

    data.lease_to_idco_attachment =
      files?.lease_to_idco_attachment?.[0]?.filename ??
      existingPlot.lease_to_idco_attachment;

    data.lease_to_ua_attachment =
      files?.lease_to_ua_attachment?.[0]?.filename ??
      existingPlot.lease_to_ua_attachment;

    // update
    const updatedPlot = await GovtPlot.updateById(id, data);

    await logAction(
      userId,
      "edit govt plot",
      "success",
      "Govt plot updated successfully",
      req.body,
      updatedPlot
    );

    return res.status(200).json({
      success: true,
      message: "Govt plot updated successfully",
      govtPlot: updatedPlot,
    });
  } catch (err) {
    await logAction(
      userId,
      "edit govt plot",
      "failure",
      err.message,
      req.body,
      null
    );

    console.error("Edit Govt Plot Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  uploadGovtPlot,
  addGovtPlot,
  govtPlotList,
  deleteGovtPlot,
  govtPlotDocumentList,
  govtPlotDocumentDelete,
  updateGovtPlot,
  downloadPlotDocument,
};
