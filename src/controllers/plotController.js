const xlsx = require("xlsx");
const Plot = require("../models/plotModel");
const path = require("path");
const fs = require("fs");

const logAction = require("../utils/logger");
const Village = require("../models/villageModel");
const Khata = require("../models/khataModel");

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

    const requiredColumns = [
      "LA Case File No.",
      "LO1-Name of Recorded Tenant (RT)",
      "LO2-Name of Present Tenant(s)",
      "Name of Village",
      "Village Code",
      "Name of the Tahasil",
      "Name of the R.I. Circle",
      "Thana No.",
      "Khata No.",
      "Plot No.",
      "Kissam of the Land",
      "LO12-Category of Land",
      "LA1-Land Area (Total Area in Acres)",
      "LA2-Land Area (Total Area in Ha.)",
      "Land Area (Total Acquired Area in Acres)",
      "Land Area (Total Acquired Area in Ha.)",
    ];

    const excelColumns = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(
      (col) => !excelColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Invalid Excel format.Missing columns",
      });
    }

    const invalidRows = [];
    data.forEach((row, index) => {
      requiredColumns.forEach((col) => {
        const value = row[col];
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (typeof value === "string" && value.trim() === "")
        ) {
          invalidRows.push({ row: index + 2, column: col }); // +2 = header + 1-based row
        }
      });
    });

    if (invalidRows.length > 0) {
      fs.unlinkSync(req.file.path);
      const firstError = invalidRows[0];
      return res.status(400).json({
        success: false,
        message: `Missing value in required field "${firstError.column}" at row ${firstError.row}. All required values must be filled.`,
      });
    }

    const insertedVillages = await Village.insertVillagesFromExcel(
      data,
      project_id,
      type
    );

    await Khata.insertKhatasFromExcel(data, project_id, type);

    const insertedPlots = await Plot.bulkInsert(data, project_id);
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
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;
    const [plots, total] = await Promise.all([
      Plot.getAllPlot(limit, offset),
      Plot.countAll(),
    ]);
    return res.status(200).json({
      success: true,
      message: "Plots fetched successfully",
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
        documentUrl: `${req.protocol}://${req.get(
          "host"
        )}/uploads/excels/${file}`,
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

const createPlot = async (req, res) => {
  const userId = req.user.id;
  const safeRequestPayload = req.body;
  try {
    if (
      !safeRequestPayload.project_id ||
      !safeRequestPayload.la_case_file_no ||
      !safeRequestPayload.name_of_recorded_tenant ||
      !safeRequestPayload.name_of_present_tenant ||
      !safeRequestPayload.village_name ||
      !safeRequestPayload.village_code ||
      !safeRequestPayload.tahasil_name ||
      !safeRequestPayload.ri_circle_name ||
      !safeRequestPayload.thana_no ||
      !safeRequestPayload.khata_no ||
      !safeRequestPayload.plot_no ||
      !safeRequestPayload.kissam_of_land ||
      !safeRequestPayload.land_category ||
      !safeRequestPayload.land_area_total_acres ||
      !safeRequestPayload.land_area_total_hectares ||
      !safeRequestPayload.land_area_acquired_acres ||
      !safeRequestPayload.land_area_acquired_hectares
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

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
    return res.status(201).json({
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

module.exports = {
  uploadPlots,
  plotList,
  plotDocumentList,
  createPlot,
  updatePlot,
  deletePlot,
  getDeletedPlots,
};
