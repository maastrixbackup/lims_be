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

// const listPlots = async (req, res) => {
//   try {
//     let { page = 1, limit = 10 } = req.query;
//     page = parseInt(page);
//     limit = parseInt(limit);

//     const offset = (page - 1) * limit;

//     // Fetch plots and total count
//     const [plots, total] = await Promise.all([
//       Plot.getAll(limit, offset),
//       Plot.countAll(),
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: "Plots fetched successfully",
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//       plots,
//     });
//   } catch (error) {
//     console.error("List Plots Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

module.exports = { uploadPlots, plotList };
