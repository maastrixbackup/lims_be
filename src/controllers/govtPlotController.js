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

const normalizeHeaderKey = (key) =>
  key?.toString().replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

const toTrimmedString = (value) =>
  value === null || value === undefined ? "" : value.toString().trim();

const normalizeHeaderCode = (value) => {
  const raw = toTrimmedString(value).replace(/\s+/g, "");
  if (!raw) return "";
  const match = raw.match(/^([A-Za-z]+)([0-9]+)$/);
  if (!match) return raw;
  return `${match[1].toUpperCase()}${match[2]}`;
};

const isLikelyHeaderCode = (value) =>
  /^[A-Za-z]{2,}[0-9]{2}$/.test(normalizeHeaderCode(value));

const buildGovtExcelRowsWithFlexibleHeaders = (sheet) => {
  const singleHeaderRows = xlsx.utils.sheet_to_json(sheet, {
    defval: null,
    raw: true,
  });

  if (!singleHeaderRows || singleHeaderRows.length === 0) return [];

  return singleHeaderRows.map((row) => {
    const normalizedRow = {};

    for (const key in row) {
      const normalizedKey = normalizeHeaderKey(key);
      normalizedRow[key] = row[key];
      normalizedRow[normalizedKey] = row[key];
    }

    return normalizedRow;
  });
};

const hasAnyValueByHeader = (row, headers) => {
  if (!row) return false;
  for (const header of headers) {
    const value = row[header] ?? row[normalizeHeaderKey(header)];
    if (value !== undefined && value !== null && `${value}`.trim() !== "") {
      return true;
    }
  }
  return false;
};

const hasAnyValueByCode = (row, code) => {
  if (!row || !code) return false;

  const target = normalizeHeaderKey(code);
  for (const key of Object.keys(row)) {
    const normalizedKey = normalizeHeaderKey(key);
    if (normalizedKey === target || normalizedKey.startsWith(`${target} `)) {
      const value = row[key];
      if (value !== undefined && value !== null && `${value}`.trim() !== "") {
        return true;
      }
    }
  }

  return false;
};

const GOVT_PLOT_ALLOWED_FIELDS = new Set([
  "project_id",
  "type",
  "district",
  "mouza",
  "tahasil",
  "thana_no",
  "ri_circle",
  "khata_no",
  "kissam",
  "name_of_ror",
  "plot_no",
  "total_area_acres",
  "proposed_area_acres",
  "total_area_hectares",
  "proposed_area_hectares",
  "lease_case_no",
  "present_status",
  "ua_idco_to_tahasildar",
  "case_details",
  "action_to_be_taken",
  "ri_report",
  "ri_report_attachment",
  "proclamation",
  "objection_received",
  "others",
  "modification_revision",
  "misc_dr_case_prep",
  "misc_dr_case_prep_number",
  "reason_for_misc_dr_case",
  "tree_enumeration",
  "tree_enumeration_attachment",
  "order_sheet_prep",
  "lease_to_idco",
  "lease_to_idco_attachment",
  "lease_to_ua",
  "lease_to_ua_attachment",
  "remarks",
]);

const GOVT_PLOT_FIELD_ALIASES = {
  village: "mouza",
  village_name: "mouza",
  district_name: "district",
  khata: "khata_no",
  plot: "plot_no",
  plot_number: "plot_no",
  kissam_of_land: "kissam",
  land_category: "kissam",
  name_of_khata: "name_of_ror",
};

const normalizeOptionalValue = (value) =>
  value === "" || value === undefined ? null : value;

const normalizeNumericValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeBooleanFlag = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value ? 1 : 0;

  const normalized = String(value).trim().toLowerCase();
  if (["1", "yes", "y", "true"].includes(normalized)) return 1;
  if (["0", "no", "n", "false"].includes(normalized)) return 0;
  return null;
};

const normalizeEnumStatus = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const normalized = String(value).trim().toLowerCase().replace(/\s+/g, " ");
  if (normalized === "not started") return "Not Started";
  if (normalized === "in progress") return "In Progress";
  if (normalized === "complete") return "Complete";
  return null;
};

const normalizePresentStatus = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && value >= 1 && value <= 4) return value;

  const rawValue = String(value).trim().toLowerCase();
  if (/^[1-4]$/.test(rawValue)) return Number(rawValue);

  const normalized = rawValue.replace(/[^a-z0-9]+/g, " ").trim();
  if (normalized.includes("sub collector")) return 1;
  if (normalized.includes("adm")) return 2;
  if (normalized.includes("demand")) return 3;
  if (normalized.includes("sanction")) return 4;
  return null;
};

const normalizeGovtPlotPayload = (
  payload = {},
  files = {},
  existingPlot = null,
) => {
  const normalizedInput = {};

  Object.entries(payload).forEach(([key, value]) => {
    const canonicalKey = GOVT_PLOT_FIELD_ALIASES[key] || key;
    normalizedInput[canonicalKey] = normalizeOptionalValue(value);
  });

  const data = {};
  GOVT_PLOT_ALLOWED_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(normalizedInput, field)) {
      data[field] = normalizedInput[field];
    }
  });

  [
    "total_area_acres",
    "proposed_area_acres",
    "total_area_hectares",
    "proposed_area_hectares",
  ].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = normalizeNumericValue(data[field]);
    }
  });

  [
    "ua_idco_to_tahasildar",
    "proclamation",
    "objection_received",
    "modification_revision",
    "misc_dr_case_prep",
    "lease_to_idco",
    "lease_to_ua",
  ].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = normalizeBooleanFlag(data[field]);
    }
  });

  ["ri_report", "tree_enumeration", "order_sheet_prep"].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = normalizeEnumStatus(data[field]);
    }
  });

  if (Object.prototype.hasOwnProperty.call(data, "present_status")) {
    data.present_status = normalizePresentStatus(data.present_status);
  }

  const fileMappings = {
    ri_report_attachment: "ri_report_attachment",
    tree_enumeration_attachment: "tree_enumeration_attachment",
    lease_to_idco_attachment: "lease_to_idco_attachment",
    lease_to_ua_attachment: "lease_to_ua_attachment",
  };

  Object.entries(fileMappings).forEach(([field, fileKey]) => {
    const uploadedFile = files?.[fileKey]?.[0]?.filename;
    if (uploadedFile) {
      data[field] = uploadedFile;
      return;
    }

    if (existingPlot) {
      data[field] = existingPlot[field] ?? null;
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = null;
    }
  });

  return data;
};

const syncGovtKhataFromPlot = async (plotData) => {
  const rows = [
    {
      district: plotData.district || null,
      mouza: plotData.mouza,
      tahasil: plotData.tahasil,
      "thana no": plotData.thana_no || null,
      "ri circle": plotData.ri_circle || null,
      "khata no": plotData.khata_no,
      "plot no": plotData.plot_no,
      kissam: plotData.kissam || null,
      "name of ror": plotData.name_of_ror || null,
      "lease case no": plotData.lease_case_no || null,
      "present status": plotData.present_status || null,
      "case details/ deservation req.": plotData.case_details || null,
    },
  ];

  const villageMap = await GovtVillage.upsertFromExcel(
    rows,
    plotData.project_id,
    plotData.type,
  );

  const villageKey = `${plotData.mouza}_${plotData.tahasil}`;
  const villageId = villageMap[villageKey];

  if (!villageId) {
    throw new Error("Unable to create/find village");
  }

  const khataMap = await GovtKhata.upsertFromExcel(
    rows,
    villageMap,
    plotData.project_id,
    plotData.type,
  );

  const khataKey = `${villageId}_${plotData.khata_no}`;
  return {
    villageId,
    khataId: khataMap[khataKey] || null,
  };
};

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
    if (!workbook.SheetNames.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Invalid Excel format. No sheet found inside file.",
      });
    }

    if (workbook.SheetNames.length > 2) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Invalid Excel format. Maximum 2 sheets are allowed inside file.",
      });
    }

    const rows = workbook.SheetNames.flatMap((sheetName) =>
      buildGovtExcelRowsWithFlexibleHeaders(workbook.Sheets[sheetName]),
    );

    if (!rows.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      });
    }

    const requiredGovtCodes = [
      "LD01",
      "LD02",
      "LD03",
      "LD06",
      "LD09",
      "CD01",
      "CD02",
      "CR01",
    ];
    const missingGroups = requiredGovtCodes.filter(
      (code) => !rows.some((row) => hasAnyValueByCode(row, code)),
    );

    if (missingGroups.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `Invalid govt land Excel format. Missing required field codes: ${missingGroups.join(", ")}`,
      });
    }
    // console.log("Header name", rows);
    const villageMap = await GovtVillage.upsertFromExcel(
      rows,
      project_id,
      type,
    );

    // govt_khata
    const khataMap = await GovtKhata.upsertFromExcel(
      rows,
      villageMap,
      project_id,
      type,
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
      null,
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
      null,
    );
    console.error("Govt Plot Excel Upload Error:", {
      message: err.message,
      stack: err.stack,
      code: err.code || null,
      sqlMessage: err.sqlMessage || null,
      project_id: req.body?.project_id || null,
      type: req.body?.type || null,
      file: req.file
        ? {
          originalname: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
        }
        : null,
    });
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const addGovtPlot = async (req, res) => {
  const userId = req.user.id;
  const files = req.files || {};
  const data = normalizeGovtPlotPayload(req.body || {}, files);

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

    if (data.lease_to_idco === 1 && !files?.lease_to_idco_attachment) {
      return res.status(400).json({
        success: false,
        message: "Lease attachment is required for IDCO",
      });
    }

    if (data.lease_to_ua === 1 && !files?.lease_to_ua_attachment) {
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

    const { villageId, khataId } = await syncGovtKhataFromPlot(data);

    // data.village_id = villageId;
    // data.khata_id = khataId;
    const govtPlot = await GovtPlot.create(data);

    await logAction(
      userId,
      "add govt plot",
      "success",
      "Govt plot created successfully",
      req.body,
      govtPlot,
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
      null,
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
            plot.tree_enumeration_attachment,
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

    const totalPages = Math.ceil(result.total / limit);

    return res.status(200).json({
      success: true,
      message: "Govt plots fetched successfully",
      page,
      limit,
      total: result.total,
      totalPages,
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
      null,
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
      null,
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
      download_name: r.filename,
      uploadedAt: r.created_at,
      // documentUrl: `${req.protocol}://${req.get("host")}${
      //   req.get("host").includes("localhost") ? "" : "/api"
      // }/plot-documents/download/${r.filename}`,

      documentUrl: `${req.protocol}://${req.get("host")}${req.get("host").includes("localhost") ? "" : "/api"
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
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${doc.original_filename || doc.filename}"`,
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

    const doc = await GovtPlot.findDocumentByFilename(fileName);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document record not found",
      });
    }

    const filePath = path.join(process.cwd(), doc.file_path);

    // delete file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // delete DB record
    await GovtPlot.deleteDocumentByFilename(fileName);

    await logAction(
      userId,
      "govt plot excel delete",
      "success",
      "Govt plot Excel file deleted successfully",
      { fileName },
      null,
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
      err.message,
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

  const files = req.files || {};
  let data = normalizeGovtPlotPayload(req.body || {}, files);

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

    data = normalizeGovtPlotPayload(req.body || {}, files, existingPlot);

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
      data.lease_to_idco === 1 &&
      !files?.lease_to_idco_attachment &&
      !existingPlot.lease_to_idco_attachment
    ) {
      return res.status(400).json({
        success: false,
        message: "Lease attachment is required for IDCO",
      });
    }

    if (
      data.lease_to_ua === 1 &&
      !files?.lease_to_ua_attachment &&
      !existingPlot.lease_to_ua_attachment
    ) {
      return res.status(400).json({
        success: false,
        message: "Lease attachment is required for UA",
      });
    }

    // update
    const updatedPlot = await GovtPlot.updateById(id, data);
    await syncGovtKhataFromPlot(updatedPlot);

    await logAction(
      userId,
      "edit govt plot",
      "success",
      "Govt plot updated successfully",
      req.body,
      updatedPlot,
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
      null,
    );

    console.error("Edit Govt Plot Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const paymentReady = async (req, res) => {
  const { plot_id, payment_status } = req.body;
  const userId = req.user.id;

  try {
    if (!plot_id) {
      return res.status(400).json({
        success: false,
        message: "Plot Id is required",
      });
    }

    if (!payment_status) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required",
      });
    }

    const allowedStatuses = ["ready", "processing"];
    if (!allowedStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment_status for this action",
      });
    }

    const plot = await GovtPlot.findById(plot_id);
    // console.log("plotData", plot);
    if (!plot) {
      return res.status(404).json({
        success: false,
        message: "Plot not found",
      });
    }

    if (payment_status === "processing") {
      const existing = await GovtPlot.hasProcessingPayments(plot_id);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Payment already in processing state",
        });
      }
    }

    const khata = await GovtKhata.getKhataByNumber(plot.khata_no);
    const unique_id = khata ? khata.unique_id : null;
    // Update plot status
    await GovtPlot.updatePaymentStatus(plot_id, payment_status);

    if (payment_status === "ready") {
      await logAction(
        userId,
        "Payment marked ready",
        "success",
        "Payment marked as ready",
        { plot_id, payment_status },
        [],
      );

      return res.status(200).json({
        success: true,
        message: "Payment marked as ready",
      });
    }

    // Split tenant names into an array
    // const tenants = plot.name_of_ror  //name_of_present_tenant is not available so i used name_of_ror
    //   ? plot.name_of_ror.split(",").map((t) => t.trim())
    //   : [];

    // const records = [];

    // for (const tenant of tenants) {
    //   const data = {
    //     unique_id,
    //     plot_id: plot.id,
    //     lease_case_no: plot.lease_case_no,
    //     plot_no: plot.plot_no,
    //     khata_no: plot.khata_no,
    //     project_id: plot.project_id,
    //     // present_tenant_names: tenant,
    //     payment_area: plot.total_area_acres,
    //     total_compensation: plot.total_compensation,
    //     bank_ac: plot.bank_account_no ?? null,
    //     bank_name: plot.bank_name ?? null,
    //     ifsc: plot.branch_ifsc ?? null,
    //     type: plot.type,
    //     status: payment_status,
    //   };

    //   const rec = await GovtPlot.addPaymentRecord(data);
    //   records.push(rec);
    // }

    //count lease cases from govt_khata
    const leaseCount = await GovtKhata.countLeaseCases(
      plot.project_id,
      plot.type,
      plot.khata_no
    );

    if (leaseCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No lease case found for this khata",
      });
    }

    const records = [];

    for (let i = 0; i < leaseCount; i++) {
      const data = {
        unique_id,
        plot_id: plot.id,
        lease_case_no: plot.lease_case_no,
        plot_no: plot.plot_no,
        khata_no: plot.khata_no,
        project_id: plot.project_id,
        payment_area: plot.total_area_acres,
        total_compensation: plot.total_compensation,
        bank_ac: plot.bank_account_no ?? null,
        bank_name: plot.bank_name ?? null,
        ifsc: plot.branch_ifsc ?? null,
        type: plot.type,
        status: payment_status,
      };

      const rec = await GovtPlot.addPaymentRecord(data);
      records.push(rec);
    }

    // } else {
    //   await Plot.updatePaymentRecordStatus(plot_id, payment_status);
    // }

    // let message = "Payment updated successfully";

    // if (payment_status === "ready") {
    //   message = "Payment marked as ready";
    // } else if (payment_status === "processing") {
    //   message = "Payment processing started";
    // } else if (payment_status === "complete") {
    //   message = "Payment completed successfully";
    // }

    await logAction(
      userId,
      "Payment processed",
      "success",
      "Payment processing started",
      { plot_id },
      records,
    );

    return res.status(200).json({
      success: true,
      message: "Payment processing started",
      data: records,
    });
  } catch (err) {
    console.error("Payment Ready Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllPaymentReady = async (req, res) => {
  try {
    const { project_id, type, plot_id } = req.query;
    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "project_id is required",
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "type is required",
      });
    }
    // Get all records
    let all = [];

    if (plot_id) {
      all = await GovtPlot.getAll(project_id, type, plot_id);
    } else {
      all = await GovtPlot.getAll(project_id, type);
    }

    if (!all.length) {
      return res.status(404).json({
        success: false,
        message: "No payment records found",
      });
    }

    // Group by unique_id
    const groups = {};

    for (const row of all) {
      if (!groups[row.unique_id]) {
        // Initialize group using first row values (all rows have same totals)
        groups[row.unique_id] = {
          unique_id: row.unique_id,
          plot_id: row.plot_id,
          project_id: row.project_id,
          khata_no: row.khata_no,
          type: row.type,
          total_area: row.payment_area || 0, // or row.total_area if exists
          total_compensation: row.total_compensation || 0,
          tenants: [],
        };
      }

      // Add each tenant row
      groups[row.unique_id].tenants.push({
        id: row.id,
        plot_no: row.plot_no,
        lease_case_no: row.lease_case_no,
        present_tenant: row.present_tenant_names,
        payment_area: 0,
        compensation_payment: 0,
        apportionment_percent: 0,
        bank_ac: row.bank_ac,
        bank_name: row.bank_name,
        ifsc: row.ifsc,
        transaction_no: row.transaction_no,
        status: row.status,
        filename: row.payment_proof,
        file_url: row.payment_proof
          ? `${req.protocol}://${req.get("host")}${req.get("host").includes("localhost") ? "" : "/api"
          }/uploads/land_cost_payments/${row.payment_proof}`
          : null
      });
    }

    return res.status(200).json({
      success: true,
      data: Object.values(groups),
    });
  } catch (err) {
    console.error("Get All Payment Ready Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const landCostPaymentUpload = async (req, res) => {
  const userId = req.user.id;

  try {
    const { land_cost_id } = req.body;

    if (!land_cost_id) {
      return res.status(400).json({
        success: false,
        message: "Land cost ID is required",
      });
    }

    // if (!req.file) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Payment proof file is required",
    //   });
    // }

    const landCostData = await GovtPlot.fetchLandCostById(land_cost_id);
    if (!landCostData) {
      return res.status(404).json({
        success: false,
        message: "Land cost record not found",
      });
    }

    const paymentProof = req.files?.payment_proof?.[0]?.filename || null;

    const demandNoteAttachment = req.files?.demand_note_attachment?.[0]?.filename || null;
    if (!paymentProof && !demandNoteAttachment) {
      return res.status(400).json({
        success: false,
        message: "At least one file is required",
      });
    }

    // const filePath = `uploads/land_cost_payments/${req.file.filename}`;

    await GovtPlot.addPaymentProof(land_cost_id, paymentProof, demandNoteAttachment);

    await logAction(
      userId,
      "upload land cost payment proof",
      "success",
      "Payment proof uploaded successfully",
      { land_cost_id },
      null,
    );

    res.status(200).json({
      success: true,
      message: "Payment proof uploaded successfully",
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    await logAction(
      userId,
      "upload land cost payment proof",
      "failure",
      err.message,
      null,
      null,
    );

    res.status(500).json({
      success: false,
      message: "Failed to upload payment proof",
    });
  }
};

const updatePlotPayment = async (req, res) => {
  const userId = req.user.id;
  const land_cost_id = req.params.id;
  const safeRequestPayload = req.body;
  const {
    payment_area,
    total_compensation,
    compensation_payment,
    apportionment_percent,
    bank_ac,
    bank_name,
    ifsc,
    transaction_no,
  } = safeRequestPayload;

  try {
    const landCost = await GovtPlot.fetchLandCostById(land_cost_id);

    if (!landCost) {
      return res.status(404).json({
        success: false,
        message: "Land cost record not found",
      });
    }

    const updateData = await GovtPlot.updatePaymentDetails({
      land_cost_id,
      payment_area,
      total_compensation,
      compensation_payment,
      apportionment_percent,
      bank_ac,
      bank_name,
      ifsc,
      transaction_no,
    });

    await logAction(
      userId,
      "update plot payment",
      "success",
      "Payment details updated",
      safeRequestPayload,
      updateData,
    );

    res.status(200).json({
      success: true,
      message: "Payment details updated successfully",
    });
  } catch (err) {
    console.error("Update payment error:", err);

    await logAction(
      userId,
      "update plot payment",
      "failure",
      err.message,
      safeRequestPayload,
      null,
    );

    res.status(500).json({
      success: false,
      message: "Failed to update payment details",
    });
  }
};

const markPaymentCompleted = async (req, res) => {
  const userId = req.user.id;
  const { unique_id, project_id, type } = req.body;

  try {
    if (!unique_id || !project_id || !type) {
      return res.status(400).json({
        success: false,
        message: "unique_id,project_id and type are required",
      });
    }

    const records = await GovtPlot.getByUniqueId(unique_id, project_id, type);

    if (!records.length) {
      return res.status(404).json({
        success: false,
        message: "No payment records found",
      });
    }

    const notProcessing = records.find((r) => r.status !== "processing");
    if (notProcessing) {
      return res.status(400).json({
        success: false,
        message: "Only processing payments can be completed",
      });
    }

    const invalid = records.find((r) => !r.payment_proof);

    if (invalid) {
      return res.status(400).json({
        success: false,
        message: "Payment proof required",
      });
    }

    await GovtPlot.markPaymentComplete(unique_id, project_id, type);

    await logAction(
      userId,
      "mark payment completed",
      "success",
      "Payment Completed",
      { unique_id, project_id, type },
      null,
    );

    res.status(200).json({
      success: true,
      message: "Payment completed successfully",
    });
  } catch (err) {
    console.error("Payment complete error:", err);

    await logAction(
      userId,
      "mark payment completed",
      "failure",
      err.message,
      req.body,
      null,
    );

    res.status(500).json({
      success: false,
      message: "Failed to mark payment completed",
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
  paymentReady,
  getAllPaymentReady,
  landCostPaymentUpload,
  updatePlotPayment,
  markPaymentCompleted
};
