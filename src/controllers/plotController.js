const xlsx = require("xlsx");
const Plot = require("../models/plotModel");
const path = require("path");
const fs = require("fs");

const logAction = require("../utils/logger");
const Village = require("../models/villageModel");
const Khata = require("../models/khataModel");
const ExcelJS = require("exceljs");

const uploadPlots = async (req, res) => {
  const userId = req.user.id;
  try {
    const { project_id, type } = req.body;
    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required for uploading plots",
      });
    }
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Type is required",
      });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "File is required" });
    }

    // Read Excel file

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!data.length) {
      fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ success: false, message: "Excel file is empty" });
    }

    // const requiredColumns = [
    //   "LA Case File No.",
    //   "LO1-Name of Recorded Tenant (RT)",
    //   "LO2-Name of Present Tenant(s)",
    //   "Name of Village",
    //   "Village Code",
    //   "Name of the Tahasil",
    //   "Name of the R.I. Circle",
    //   "Thana No.",
    //   "Khata No.",
    //   "Plot No.",
    //   "Kissam of the Land",
    //   "LO12-Category of Land",
    //   "LA1-Land Area (Total Area in Acres)",
    //   "LA2-Land Area (Total Area in Ha.)",
    //   "Land Area (Total Acquired Area in Acres)",
    //   "Land Area (Total Acquired Area in Ha.)",
    // ];

    const requiredColumns = {
      "LA Case File No.": [],
      "LO1-Name of Recorded Tenant (RT)": ["Name of Tenant"],
      "LO2-Name of Present Tenant(s)": ["Name of Tenant"],
      "Name of Village": ["name of village"],
      "Village Code": [],
      "Name of the Tahasil": ["Tahasil/Thana"],
      "Name of the R.I. Circle": [],
      "Thana No.": ["Thana no"],
      "Khata No.": ["Khata No"],
      "Plot No.": [],
      "Kissam of the Land": ["Kissam"],
      "LO12-Category of Land": [],
      "LA1-Land Area (Total Area in Acres)": ["ROR Area In Ha."],
      "LA2-Land Area (Total Area in Ha.)": ["Area occupied in Ha."],
      "Land Area (Total Acquired Area in Acres)": [],
      "Land Area (Total Acquired Area in Ha.)": [],
    }; //These are required fields but These columns are set to null in the table because there are some blank values in the Excel file.

    const excelColumns = Object.keys(data[0]).map((col) =>
      col.trim().toLowerCase()
    );

    // Detect missing required columns (considering aliases)
    const missingColumns = Object.keys(requiredColumns).filter((mainCol) => {
      const mainLower = mainCol.trim().toLowerCase();
      const aliases = (requiredColumns[mainCol] || []).map((a) =>
        a.trim().toLowerCase()
      );
      const allOptions = [mainLower, ...aliases];
      return !allOptions.some((option) => excelColumns.includes(option));
    });

    if (missingColumns.length > 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `Invalid Excel format. Missing columns: ${missingColumns.join(
          ", "
        )}`,
      });
    }

    // const excelColumns = Object.keys(data[0]);
    // const missingColumns = requiredColumns.filter(
    //   (col) => !excelColumns.includes(col)
    // );

    // if (missingColumns.length > 0) {
    //   fs.unlinkSync(req.file.path);
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid Excel format.Missing columns",
    //   });
    // }

    // const invalidRows = [];
    // data.forEach((row, index) => {
    //   requiredColumns.forEach((col) => {
    //     const value = row[col];
    //     if (
    //       value === undefined ||
    //       value === null ||
    //       value === "" ||
    //       (typeof value === "string" && value.trim() === "")
    //     ) {
    //       invalidRows.push({ row: index + 2, column: col }); // +2 = header + 1-based row
    //     }
    //   });
    // });

    // if (invalidRows.length > 0) {
    //   fs.unlinkSync(req.file.path);
    //   const firstError = invalidRows[0];
    //   return res.status(400).json({
    //     success: false,
    //     message: `Missing value in required field "${firstError.column}" at row ${firstError.row}. All required values must be filled.`,
    //   });
    // }

    const insertedVillages = await Village.insertVillagesFromExcel(
      data,
      project_id,
      type
    );

    const insertedPlots = await Plot.bulkInsert(data, project_id, type);

    await Khata.insertKhatasFromExcel(data, project_id, type);

    await logAction(
      userId,
      "plot excel upload",
      "success",
      "Plots inserted successfully",
      { project_id },
      null
    );
    return res.status(201).json({
      success: true,
      message:
        insertedPlots > 0
          ? "Plots inserted successfully"
          : "No new plots inserted",
    });
  } catch (err) {
    await logAction(
      userId,
      "plot excel upload",
      "failure",
      err.message,
      null,
      null
    );
    console.error("Upload Plots Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const plotList = async (req, res) => {
  try {
    let { page = 1, limit = 10, project_id, type } = req.query;
    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;
    const [plots, total] = await Promise.all([
      Plot.getAllPlot(project_id, type, limit, offset),
      Plot.countAll(project_id, type),
    ]);
    return res.status(200).json({
      success: true,
      message: "Plots fetched successfully",
      project_id,
      type,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      plots,
    });
  } catch (err) {
    console.error("Plot List Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const plotDocumentList = async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads/excels");
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({
        success: true,
        message: "Uploads/excels directory not found",
        files: [],
      });
    }

    const files = fs.readdirSync(uploadsDir);
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
        size: `${(stats.size / 1024).toFixed(2)} KB`,
        uploadedAt: stats.mtime,
        // documentUrl: `${req.protocol}://${req.get(
        //   "host"
        // )}/uploads/excels/${file}`,
        documentUrl: `${req.protocol}://${req.get("host")}${
          req.get("host").includes("localhost") ? "" : "/api"
        }/uploads/excels/${file}`,
      };
    });

    return res.status(200).json({
      success: true,
      total: fileList.length,
      files: fileList,
    });
  } catch (err) {
    console.error("Error reading uploads:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching plot Excel files",
    });
  }
};

const plotDocumentDelete = async (req, res) => {
  const userId = req.user.id;
  try {
    const { fileName } = req.params;
    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: "File name is required",
      });
    }
    const filePath = path.join(process.cwd(), "uploads/excels", fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    fs.unlinkSync(filePath);
    await logAction(
      userId,
      "plot excel delete",
      "success",
      "Plot Excel file deleted successfully",
      { fileName },
      null
    );

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
      deletedFile: fileName,
    });
  } catch (err) {
    console.error("Error deleting file:", err);

    await logAction(
      userId,
      "plot excel delete",
      "failed",
      "Failed to delete plot Excel file",
      null,
      err.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error while deleting file",
    });
  }
};

const createPlot = async (req, res) => {
  const userId = req.user.id;
  // const safeRequestPayload = req.body;
  const safeRequestPayload = { ...req.body };

  // Object.keys(safeRequestPayload).forEach((key) => {
  //   if (safeRequestPayload[key] === "") {
  //     safeRequestPayload[key] = null;
  //   }
  // });
  Object.keys(safeRequestPayload).forEach((k) => {
    if (safeRequestPayload[k] === "" || safeRequestPayload[k] === undefined) {
      safeRequestPayload[k] = null;
    }
  });
  // if (!["PDF", "PAF"].includes(safeRequestPayload.displaced_affected_person)) {
  //   safeRequestPayload.displaced_affected_person = null;
  // }
  try {
    // if (
    //   !safeRequestPayload.project_id ||
    //   !safeRequestPayload.la_case_file_no ||
    //   // !safeRequestPayload.name_of_recorded_tenant ||
    //   // !safeRequestPayload.name_of_present_tenant ||
    //   !safeRequestPayload.village_name ||
    //   !safeRequestPayload.village_code ||
    //   !safeRequestPayload.tahasil_name ||
    //   !safeRequestPayload.ri_circle_name ||
    //   !safeRequestPayload.thana_no ||
    //   !safeRequestPayload.khata_no ||
    //   !safeRequestPayload.plot_no ||
    //   !safeRequestPayload.kissam_of_land ||
    //   !safeRequestPayload.land_category ||
    //   // !safeRequestPayload.land_area_total_acres ||
    //   // !safeRequestPayload.land_area_total_hectares ||
    //   // !safeRequestPayload.land_area_acquired_acres ||
    //   // !safeRequestPayload.land_area_acquired_hectares ||
    //   !safeRequestPayload.type
    // ) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "All fields are required",
    //   });
    // }

    const requiredFields = [
      "project_id",
      "la_case_file_no",
      // "village_name",
      // "village_code",
      // "tahasil_name",
      // "ri_circle_name",
      // "thana_no",
      // "khata_no",
      // "plot_no",
      // "kissam_of_land",
      // "land_category",
      "type",
    ];

    for (const field of requiredFields) {
      if (
        safeRequestPayload[field] === null ||
        safeRequestPayload[field] === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
    }

    const enumMaps = {
      displaced_affected_person: ["PDF", "PAF"],
      family_with_orphan_members: ["Y", "N"],
      tribunal: ["Y", "N"],
      abatement: ["Yes", "No"],
    };

    Object.entries(enumMaps).forEach(([key, allowed]) => {
      if (
        safeRequestPayload[key] !== null &&
        safeRequestPayload[key] !== undefined &&
        !allowed.includes(safeRequestPayload[key])
      ) {
        safeRequestPayload[key] = null;
      }
    });

    const dateFields = [
      "date_of_award",
      "grievance_date",
      "land_case_date",
      "tribunal_deposit_date",
    ];

    dateFields.forEach((f) => {
      if (safeRequestPayload[f]) {
        const d = new Date(safeRequestPayload[f]);
        safeRequestPayload[f] = isNaN(d.getTime())
          ? null
          : d.toISOString().slice(0, 10);
      }
    });

    const existingPlot = await Plot.findByCaseFileNo(
      safeRequestPayload.la_case_file_no
    );
    let plot, message;
    if (existingPlot) {
      plot = await Plot.updateByCaseFileNo(
        safeRequestPayload.la_case_file_no,
        safeRequestPayload
      );
      message = "Plot updated successfully (existing LA Case File No.)";
      await logAction(
        userId,
        "update plot (via create)",
        "success",
        message,
        safeRequestPayload,
        plot
      );
    } else {
      plot = await Plot.create(safeRequestPayload);
      message = "Plot created successfully";

      await logAction(
        userId,
        "create plot",
        "success",
        message,
        safeRequestPayload,
        plot
      );
    }

    await Village.insertVillageForManualPlot(
      safeRequestPayload,
      safeRequestPayload.project_id,
      safeRequestPayload.type
    );

    if (safeRequestPayload.khata_no) {
      await Khata.insertKhataFromManualPlot({
        project_id: safeRequestPayload.project_id,
        type: safeRequestPayload.type,
        khata_no: safeRequestPayload.khata_no,
      });
    }

    return res.status(existingPlot ? 200 : 201).json({
      success: true,
      message: message,
    });
  } catch (err) {
    await logAction(
      userId,
      "create plot",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updatePlot = async (req, res) => {
  const userId = req.user.id;
  const id = req.params.id;
  const safeRequestPayload = req.body;
  try {
    const existing = await Plot.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Plot not found",
      });
    }
    if (safeRequestPayload.la_case_file_no) {
      const duplicate = await Plot.findByCaseFileNo(
        safeRequestPayload.la_case_file_no
      );
      if (duplicate && duplicate.id !== Number(id)) {
        return res.status(400).json({
          success: false,
          message: `LA Case File No. '${safeRequestPayload.la_case_file_no}' already exist.`,
        });
      }
    }
    const updated = await Plot.update(id, safeRequestPayload);
    await logAction(
      userId,
      "update plot",
      "success",
      "Plot updated",
      safeRequestPayload,
      updated
    );
    res.status(200).json({
      success: true,
      message: "Plot updated successfully",
      plot: updated,
    });
  } catch (err) {
    await logAction(
      userId,
      "update plot",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );
    res.status(500).json({ success: false, message: err.message });
  }
};

const deletePlot = async (req, res) => {
  const userId = req.user.id;
  const plotId = req.params.id;

  try {
    const deleted = await Plot.plotDelete(plotId);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Plot not found" });
    }
    await logAction(
      userId,
      "delete plot",
      "success",
      "Plot soft deleted",
      { plotId },
      null
    );

    return res
      .status(200)
      .json({ success: true, message: "Plot soft deleted successfully" });
  } catch (err) {
    await logAction(
      userId,
      "delete plot",
      "failure",
      err.message,
      { plotId },
      null
    );
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDeletedPlots = async (req, res) => {
  const userId = req.user.id;
  try {
    const deletedPlots = await Plot.getDeletedPlots();
    if (!deletedPlots.length) {
      return res.status(404).json({
        success: false,
        message: "No deleted plots found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deleted plots fetched successfully",
      data: deletedPlots,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const restorePlot = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const restored = await Plot.restorePlot(id);
    if (!restored) {
      return res.status(404).json({
        success: false,
        message: "Plot not found or already active",
      });
    }
    await logAction(
      userId,
      "restore plot",
      "success",
      "Plot restored successfully",
      { id },
      null
    );

    return res.status(200).json({
      success: true,
      message: "Plot restored successfully",
    });
  } catch (err) {
    await logAction(
      userId,
      "restore plot",
      "failure",
      err.message,
      { id },
      null
    );
    res.status(500).json({ success: false, message: err.message });
  }
};

// const paymentReady = async (req, res) => {
//   const { plot_id } = req.body;
//   const userId = req.user.id;

//   try {
//     if (!plot_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Plot Id is required",
//       });
//     }

//     const plot = await Plot.findById(plot_id);
//     if (!plot) {
//       return res.status(404).json({
//         success: false,
//         message: "Plot not found",
//       });
//     }

//     await Plot.updatePaymentStatus(plot_id, "Processing");

//     const paymentData = {
//       plot_id: plot.id,
//       // unique_id: plot.unique_id,
//       // //unique id is not in plots table.
//       // we have to fetch unique_id from khatas table by khata_no
//       khata_no: plot.khata_no,
//       project_id: plot.project_id,

//       present_tenant_names: plot.name_of_present_tenant, // comma separated
//       total_compensation: plot.total_compensation,

//       bank_ac: plot.bank_account_no,
//       bank_name: plot.bank_name,
//       ifsc: plot.branch_ifsc,

//       status: "Processing",
//     };

//     const paymentRecord = await Plot.addPaymentRecord(paymentData);

//     await logAction(
//       userId,
//       "Payment ready",
//       "success",
//       "Payment processed successfully",
//       { plot_id },
//       paymentRecord
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Payment processed successfully",
//       data: paymentRecord,
//     });
//   } catch (err) {
//     console.error("Payment Ready Error:", err);

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };
// Updated Payment Ready Controller

const paymentReady = async (req, res) => {
  const { plot_id } = req.body;
  const userId = req.user.id;

  try {
    if (!plot_id) {
      return res.status(400).json({
        success: false,
        message: "Plot Id is required",
      });
    }

    const plot = await Plot.findById(plot_id);
    if (!plot) {
      return res.status(404).json({
        success: false,
        message: "Plot not found",
      });
    }

    const khata = await Khata.getKhataByNumber(plot.khata_no);
    const unique_id = khata ? khata.unique_id : null;
    // Update plot status
    await Plot.updatePaymentStatus(plot_id, "Processing");

    // Split tenant names into an array
    const tenants = plot.name_of_present_tenant
      ? plot.name_of_present_tenant.split(",").map((t) => t.trim())
      : [];

    const records = [];

    for (const tenant of tenants) {
      const data = {
        unique_id,
        plot_id: plot.id,
        plot_no: plot.plot_no,
        khata_no: plot.khata_no,
        project_id: plot.project_id,
        present_tenant_names: tenant,
        payment_area: plot.land_area_total_acres,
        total_compensation: plot.total_compensation,
        bank_ac: plot.bank_account_no,
        bank_name: plot.bank_name,
        ifsc: plot.branch_ifsc,
        status: "Processing",
      };

      const rec = await Plot.addPaymentRecord(data);
      records.push(rec);
    }

    await logAction(
      userId,
      "Payment ready",
      "success",
      "Payment processed successfully",
      { plot_id },
      records
    );

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
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

// const getCompensation = async (req, res) => {
//   const { plot_id } = req.query;

//   try {
//     if (!plot_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Plot ID is required",
//       });
//     }

//     const compensationData = await Plot.getCompensationByPlotId(plot_id);

//     if (!compensationData || compensationData.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No compensation record found for this plot",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Compensation data retrieved successfully",
//       data: compensationData,
//     });
//   } catch (err) {
//     console.error("Get Compensation Error:", err);

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// const getAllPaymentReady = async (req, res) => {
//   try {
//     // 1. Get all records from plot_payments
//     const all = await Plot.getAll();

//     if (!all.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No payment records found",
//       });
//     }

//     // 2. Group by unique_id
//     const groups = {};

//     for (const row of all) {
//       if (!groups[row.unique_id]) {
//         // Fetch khata info for summary
//         const khata = await Khata.getKhataByNumber(row.khata_no);

//         groups[row.unique_id] = {
//           unique_id: row.unique_id,
//           khata_no: row.khata_no,
//           total_area: khata?.total_area ?? 0,
//           total_compensation: khata?.total_compensation ?? 0,
//           tenants: [],
//         };
//       }

//       // push tenant row
//       groups[row.unique_id].tenants.push({
//         plot_no: row.plot_no,
//         present_tenant: row.present_tenant_names,
//         payment_area: row.payment_area,
//         compensation_payment: row.compensation_payment,
//         apportionment_percent: row.apportionment_percent,
//         bank_ac: row.bank_ac,
//         bank_name: row.bank_name,
//         ifsc: row.ifsc,
//         status: row.status,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: Object.values(groups),
//     });
//   } catch (err) {
//     console.error("Get All Payment Ready Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };
const getAllPaymentReady = async (req, res) => {
  try {
    const { project_id } = req.query;
    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "project_id is required",
      });
    }
    // Get all records
    const all = await Plot.getAll(project_id);

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
          project_id: row.project_id,
          khata_no: row.khata_no,
          total_area: row.payment_area || 0, // or row.total_area if exists
          total_compensation: row.total_compensation || 0,
          tenants: [],
        };
      }

      // Add each tenant row
      groups[row.unique_id].tenants.push({
        plot_no: row.plot_no,
        present_tenant: row.present_tenant_names,
        payment_area: 0,
        compensation_payment: 0,
        apportionment_percent: 0,
        bank_ac: row.bank_ac,
        bank_name: row.bank_name,
        ifsc: row.ifsc,
        status: row.status,
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

const exportPlot = async (req, res) => {
  const userId = req.user.id;

  try {
    const { project_id, type } = req.query;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }
    const plots = await Plot.getAllPlot(project_id, type, 1000000, 0);

    const plotTypeMap = {
      1: "Private Land",
      2: "Govt Land",
      3: "Forest Land",
    };

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Plot Report");

    sheet.addRow([
      "Sl/No",
      "Project Name",
      "LA Case File No",
      "Khata No",
      "Plot No",
      "SES Survey No",
      "Date of Award",
      "Recorded Tenant",
      "Present Tenant",
      "Number Of Present Tenant",
      "Present Address",
      "Displaced/Affected",
      "Village",
      "Tahasil",
      "RI Circle",
      "Thana No",
      "Land Type",
      "Payment Status",
      "Created At",
      "Updated At",
    ]);

    plots.forEach((p, index) => {
      sheet.addRow([
        index + 1,
        p.project_name,
        p.la_case_file_no,
        p.khata_no,
        p.plot_no,
        p.ses_survey_no,
        p.date_of_award,
        p.name_of_recorded_tenant,
        p.name_of_present_tenant,
        p.present_tenant_count,
        p.present_address,
        p.displaced_affected_person,
        p.village_name,
        p.tahasil_name,
        p.ri_circle_name,
        p.thana_no,
        plotTypeMap[p.type],
        p.payment_status,
        p.created_at,
        p.updated_at,
      ]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=plot_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

    await logAction(
      userId,
      "export plot",
      "success",
      "Plot exported successfully",
      { project_id, type },
      null
    );
  } catch (err) {
    console.error("Export Plot Error:", err);

    await logAction(userId, "export plot", "failure", err.message, null, null);

    return res.status(500).json({
      success: false,
      message: "Failed to export plot",
    });
  }
};

module.exports = {
  uploadPlots,
  plotList,
  plotDocumentList,
  createPlot,
  updatePlot,
  deletePlot,
  getDeletedPlots,
  restorePlot,
  paymentReady,
  getAllPaymentReady,
  exportPlot,
  plotDocumentDelete,
};
