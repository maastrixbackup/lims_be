const xlsx = require("xlsx");
const Plot = require("../models/plotModel");
const logAction = require("../utils/logger");

const uploadPlots = async (req, res) => {
  const userId = req.user.id;
  try {
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
      return res
        .status(400)
        .json({ success: false, message: "Excel file is empty" });
    }

    const requiredColumns = [
      "SES Survey No.",
      "LA Case File No.",
      "Date of Award",
      "LO1-Name of Recorded Tenant (RT)",
    ];

    const excelColumns = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(
      (col) => !excelColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid Excel format.Missing columns",
      });
    }

    const insertedPlots = await Plot.bulkInsert(data);
    await logAction(
      userId,
      "plot excel upload",
      "success",
      `${insertedPlots} plots inserted successfully`,
      null,
      null
    );
    return res.status(201).json({
      success: true,
      message:
        insertedPlots > 0
          ? `${insertedPlots} plots inserted successfully`
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

const createPlot = async (req, res) => {
  const userId = req.user.id;
  const safeRequestPayload = req.body;
  try {
    if (!safeRequestPayload.ses_survey_no || !safeRequestPayload.plot_no) {
      return res.status(400).json({
        success: false,
        message: "Survey No and Plot No are required",
      });
    }
    const plot = await Plot.create(safeRequestPayload);
    await logAction(
      userId,
      "create plot",
      "success",
      "Plot created",
      safeRequestPayload,
      plot
    );
    return res.status(201).json({
      success: true,
      message: "Plot created successfully",
      plot,
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

module.exports = { uploadPlots, plotList, createPlot, updatePlot };
