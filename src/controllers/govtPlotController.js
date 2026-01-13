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
    const khataMap = await GovtKhata.upsertFromExcel(rows, villageMap);

    await GovtPlot.bulkInsertFromExcel(rows, project_id, type);
    // await GovtKhata.upsertFromExcel(rows);

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

    data.ri_report_attachment =
      files?.ri_report_attachment?.[0]?.filename || null;

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

const govtPlotList = async (req, res) => {
  try {
    let { page = 1, limit = 10, project_id } = req.query;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "project_id is required",
      });
    }

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const result = await GovtPlot.findAll({
      project_id,
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

const govtPlotDocumentList = async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads/govt_plot_excels");

    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({
        success: true,
        message: "Govt plot documents directory not found",
        files: [],
      });
    }

    const files = fs.readdirSync(uploadsDir);

    // if (!files.length) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "No govt plot documents found",
    //     files: [],
    //   });
    // }

    const excelFiles = files.filter((f) => f.match(/\.(xls|xlsx)$/i));

    if (excelFiles.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Excel files found",
        files: [],
      });
    }

    const fileList = excelFiles.map((file) => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);

      return {
        name: file,
        // size: `${(stats.size / 1024).toFixed(2)} KB`,
        uploadedAt: stats.mtime,
        documentUrl: `${req.protocol}://${req.get("host")}${
          req.get("host").includes("localhost") ? "" : "/api"
        }/uploads/govt_plot_excels/${file}`,
      };
    });

    return res.status(200).json({
      success: true,
      total: fileList.length,
      files: fileList,
    });
  } catch (err) {
    console.error("Govt Plot Document List Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching govt plot documents",
    });
  }
};

module.exports = {
  uploadGovtPlot,
  addGovtPlot,
  govtPlotList,
  deleteGovtPlot,
  govtPlotDocumentList,
};
